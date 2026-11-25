#!/usr/bin/env python3
"""Coursekit local helper.

Serves the learning app and the course packs on http://127.0.0.1:8737, keeps
progress in files on this computer, and runs Python for the app on this
computer, with the libraries and GPU of whichever Python you point it at.

    python3 helper/coursekit.py                      # use this Python for code
    python3 helper/coursekit.py --python ~/venvs/ml/bin/python   # e.g. an env with CUDA torch

Standard library only. Everything is stored under ~/.coursekit (or $COURSEKIT_HOME).
"""
import argparse
import json
import mimetypes
import os
import queue
import re
import secrets
import shutil
import signal
import subprocess
import sys
import threading
import time
import webbrowser
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

VERSION = "0.1.0"
ROOT = Path(__file__).resolve().parent.parent
KERNEL = Path(__file__).resolve().parent / "kernel.py"
MARK = "\x1eCK"
SAFE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/markdown", ".md")


class Config:
    def __init__(self, args):
        self.home = Path(args.home or os.environ.get("COURSEKIT_HOME") or Path.home() / ".coursekit").expanduser()
        self.packs = Path(args.packs).expanduser().resolve() if args.packs else ROOT / "packs"
        self.app = ROOT / "app"
        self.python = args.python or sys.executable
        self.port = args.port
        self.token = secrets.token_urlsafe(24)
        for d in ("progress", "work", "nb"):
            (self.home / d).mkdir(parents=True, exist_ok=True)

    def workdir(self, pack):
        """Per-course working directory for kernels: a copy of the pack's data plus uploaded files."""
        w = self.home / "work" / pack
        w.mkdir(parents=True, exist_ok=True)
        src = self.packs / pack / "data"
        if src.is_dir():
            for f in src.iterdir():
                dst = w / f.name
                if f.is_file() and (not dst.exists() or dst.stat().st_mtime < f.stat().st_mtime):
                    shutil.copy2(f, dst)
        return w


def gpu_info():
    try:
        out = subprocess.run(["nvidia-smi", "--query-gpu=name,memory.total", "--format=csv,noheader"],
                             capture_output=True, text=True, timeout=5)
        names = [l.strip() for l in out.stdout.splitlines() if l.strip()]
        return names or None
    except Exception:  # noqa: BLE001 - no NVIDIA tools, no GPU to report
        return None


def python_version(py):
    try:
        out = subprocess.run([py, "-c", "import sys;print(sys.version.split()[0])"], capture_output=True, text=True, timeout=20)
        return out.stdout.strip() or None
    except Exception:  # noqa: BLE001
        return None


class Kernel:
    """One persistent Python process (see kernel.py) for one course and namespace."""

    def __init__(self, cfg, pack, ns):
        self.key = (pack, ns)
        self.lock = threading.Lock()
        self.used = time.time()
        self.seq = 0
        self.q = queue.Queue()
        env = dict(os.environ, PYTHONUNBUFFERED="1", PYTHONIOENCODING="utf-8", MPLBACKEND="Agg")
        kw = {"start_new_session": True} if os.name == "posix" else {"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP}
        self.p = subprocess.Popen([cfg.python, "-u", str(KERNEL)], cwd=str(cfg.workdir(pack)), env=env,
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                  text=True, encoding="utf-8", bufsize=1, **kw)
        threading.Thread(target=self._read, daemon=True).start()

    def _read(self):
        for line in self.p.stdout:
            if line.startswith(MARK):
                try:
                    self.q.put(json.loads(line[len(MARK):]))
                except ValueError:
                    pass
            else:
                self.q.put({"stray": line})
        self.q.put(None)

    def alive(self):
        return self.p.poll() is None

    def run(self, code, timeout):
        with self.lock:
            self.used = time.time()
            self.seq += 1
            sid = self.seq
            try:
                self.p.stdin.write(json.dumps({"code": code, "id": sid}) + "\n")
                self.p.stdin.flush()
            except (BrokenPipeError, OSError):
                return {"ok": False, "error": "Python stopped. It restarts on the next run.", "out": "", "imgs": []}
            stray = ""
            deadline = time.time() + timeout
            while True:
                left = deadline - time.time()
                if left <= 0:
                    self.interrupt()
                    try:
                        msg = self.q.get(timeout=5)
                    except queue.Empty:
                        msg = None
                    if not msg or "stray" in msg:
                        self.kill()
                    return {"ok": False, "error": "Stopped: the code ran longer than %d s. Python restarts on the next run." % timeout,
                            "out": stray, "imgs": []}
                try:
                    msg = self.q.get(timeout=min(left, 1.0))
                except queue.Empty:
                    continue
                if msg is None:
                    return {"ok": False, "error": "Python exited (it may have run out of memory). It restarts on the next run.",
                            "out": stray, "imgs": []}
                if "stray" in msg:
                    stray += msg["stray"]
                    continue
                if msg.get("id") != sid:
                    continue
                return {"ok": msg["ok"], "out": stray + (msg.get("out") or ""), "error": msg.get("err"),
                        "value": msg.get("value"), "imgs": msg.get("imgs") or [], "ms": msg.get("ms")}

    def interrupt(self):
        if not self.alive():
            return
        try:
            if os.name == "posix":
                self.p.send_signal(signal.SIGINT)
            else:
                self.p.send_signal(signal.CTRL_BREAK_EVENT)
        except OSError:
            pass

    def kill(self):
        try:
            self.p.kill()
        except OSError:
            pass


class Kernels:
    MAX = 8

    def __init__(self, cfg):
        self.cfg = cfg
        self.lock = threading.Lock()
        self.k = {}

    def get(self, pack, ns, create=True):
        with self.lock:
            k = self.k.get((pack, ns))
            if k and not k.alive():
                del self.k[(pack, ns)]
                k = None
            if not k and create:
                while len(self.k) >= self.MAX:
                    old = min(self.k.values(), key=lambda x: x.used)
                    old.kill()
                    del self.k[old.key]
                k = Kernel(self.cfg, pack, ns)
                self.k[(pack, ns)] = k
            return k

    def reset(self, pack, ns):
        with self.lock:
            k = self.k.pop((pack, ns), None)
        if k:
            k.kill()

    def shutdown(self):
        for k in list(self.k.values()):
            k.kill()


def make_handler(cfg, kernels, info):
    class H(BaseHTTPRequestHandler):
        server_version = "Coursekit/" + VERSION

        def log_message(self, fmt, *args):  # quiet by default
            if os.environ.get("COURSEKIT_DEBUG"):
                sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

        # --- helpers
        def send(self, code, body=b"", ctype="application/json", extra=None):
            if isinstance(body, (dict, list)):
                body = json.dumps(body).encode()
            elif isinstance(body, str):
                body = body.encode()
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-cache")
            self.send_header("X-Content-Type-Options", "nosniff")
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)

        def body(self, limit=50 * 1024 * 1024):
            n = int(self.headers.get("Content-Length") or 0)
            if n > limit:
                raise ValueError("request too large")
            return self.rfile.read(n) if n else b""

        def json_body(self):
            raw = self.body()
            return json.loads(raw or b"{}")

        def host_ok(self):
            # Refuse requests that reach us under another host name (DNS rebinding).
            host = (self.headers.get("Host") or "").rsplit(":", 1)[0].strip("[]")
            return host in ("127.0.0.1", "localhost", "::1")

        def authed(self):
            return secrets.compare_digest(self.headers.get("X-Coursekit-Token") or "", cfg.token)

        def static(self, base, rel):
            p = (base / unquote(rel)).resolve()
            if base.resolve() not in p.parents and p != base.resolve():
                return self.send(404, {"error": "not found"})
            if p.is_dir():
                p = p / "index.html"
            if not p.is_file():
                return self.send(404, {"error": "not found"})
            ctype = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
            if ctype.startswith("text/") or ctype in ("application/json", "text/javascript"):
                ctype += "; charset=utf-8"
            self.send(200, p.read_bytes(), ctype)

        def pack_index(self):
            packs = []
            for d in sorted(cfg.packs.iterdir()):
                f = d / "course.json"
                if f.is_file():
                    try:
                        c = json.loads(f.read_text("utf-8"))
                        packs.append({"id": c.get("id", d.name), "title": c.get("title", d.name),
                                      "subtitle": c.get("subtitle", ""), "description": c.get("description", "")})
                    except ValueError:
                        pass
            self.send(200, {"packs": packs})

        def doc_path(self, kind, pack, name=None):
            if not SAFE.match(pack) or (name is not None and not SAFE.match(name)):
                return None
            if kind == "progress":
                return cfg.home / "progress" / (pack + ".json")
            d = cfg.home / "nb" / pack
            d.mkdir(parents=True, exist_ok=True)
            return d / (name + ".json")

        # --- verbs
        def do_HEAD(self):
            self.do_GET()

        def do_GET(self):
            if not self.host_ok():
                return self.send(403, {"error": "bad host"})
            u = urlparse(self.path)
            path = u.path
            if path == "/":
                return self.send(302, b"", "text/plain", {"Location": "/app/"})
            if path == "/api/status":
                return self.send(200, dict(info, token=cfg.token, kernels=len(kernels.k)))
            if path == "/packs/index.json":
                return self.pack_index()
            if path.startswith("/app/"):
                return self.static(cfg.app, path[5:])
            if path.startswith("/packs/"):
                return self.static(cfg.packs, path[7:])
            m = re.match(r"^/api/(progress|nb)/([^/]+)(?:/([^/]+))?$", path)
            if m:
                if not self.authed():
                    return self.send(401, {"error": "token required"})
                p = self.doc_path(m.group(1), m.group(2), m.group(3) if m.group(1) == "nb" else None)
                if not p:
                    return self.send(400, {"error": "bad name"})
                if not p.is_file():
                    return self.send(404, {"error": "none yet"})
                return self.send(200, p.read_bytes())
            if path == "/api/has":
                q = parse_qs(u.query)
                k = kernels.get(q.get("pack", [""])[0], q.get("ns", [""])[0], create=False)
                return self.send(200, {"has": bool(k)})
            if path == "/api/context":
                f = cfg.home / "context.json"
                return self.send(200, f.read_bytes() if f.is_file() else b"{}")
            return self.send(404, {"error": "not found"})

        def do_PUT(self):
            if not self.host_ok() or not self.authed():
                return self.send(403, {"error": "forbidden"})
            path = urlparse(self.path).path
            m = re.match(r"^/api/(progress|nb)/([^/]+)(?:/([^/]+))?$", path)
            if m:
                p = self.doc_path(m.group(1), m.group(2), m.group(3) if m.group(1) == "nb" else None)
                if not p:
                    return self.send(400, {"error": "bad name"})
                raw = self.body()
                json.loads(raw)  # must be JSON
                tmp = p.with_suffix(".tmp")
                tmp.write_bytes(raw)
                os.replace(tmp, p)
                return self.send(200, {"ok": True})
            m = re.match(r"^/api/files/([^/]+)/([^/]+)$", path)
            if m and SAFE.match(m.group(1)) and SAFE.match(unquote(m.group(2))):
                (cfg.workdir(m.group(1)) / unquote(m.group(2))).write_bytes(self.body())
                return self.send(200, {"ok": True})
            return self.send(404, {"error": "not found"})

        def do_POST(self):
            if not self.host_ok() or not self.authed():
                return self.send(403, {"error": "forbidden"})
            path = urlparse(self.path).path
            try:
                req = self.json_body()
            except ValueError:
                return self.send(400, {"error": "bad json"})
            pack, ns = str(req.get("pack", "")), str(req.get("ns") or "_")
            if path in ("/api/run", "/api/reset", "/api/interrupt") and not SAFE.match(pack):
                return self.send(400, {"error": "bad pack"})
            if path == "/api/run":
                k = kernels.get(pack, ns)
                timeout = max(5, min(int(req.get("timeout") or 600), 24 * 3600))
                res = k.run(str(req.get("code", "")), timeout)
                if not req.get("ns"):
                    kernels.reset(pack, ns)
                return self.send(200, res)
            if path == "/api/reset":
                kernels.reset(pack, ns)
                return self.send(200, {"ok": True})
            if path == "/api/interrupt":
                k = kernels.get(pack, ns, create=False)
                if k:
                    k.interrupt()
                return self.send(200, {"ok": True})
            if path == "/api/context":
                req["at"] = int(time.time())
                (cfg.home / "context.json").write_text(json.dumps(req, ensure_ascii=False), "utf-8")
                return self.send(200, {"ok": True})
            return self.send(404, {"error": "not found"})

    return H


def main():
    ap = argparse.ArgumentParser(description="Coursekit local helper")
    ap.add_argument("--port", type=int, default=int(os.environ.get("COURSEKIT_PORT", 8737)))
    ap.add_argument("--python", help="Python interpreter that runs course code (default: this one)")
    ap.add_argument("--packs", help="folder of course packs (default: packs/ in this repository)")
    ap.add_argument("--home", help="where progress and work files are kept (default: ~/.coursekit)")
    ap.add_argument("--no-browser", action="store_true", help="don't open the app in a browser")
    args = ap.parse_args()
    cfg = Config(args)
    info = {"helper": True, "version": VERSION, "python": cfg.python, "pythonVersion": python_version(cfg.python),
            "gpu": gpu_info(), "home": str(cfg.home), "packs": str(cfg.packs)}
    if not info["pythonVersion"]:
        sys.exit("Could not run %s. Pass --python with a working interpreter." % cfg.python)
    kernels = Kernels(cfg)
    httpd = ThreadingHTTPServer(("127.0.0.1", cfg.port), make_handler(cfg, kernels, info))
    httpd.daemon_threads = True
    (cfg.home / "helper.json").write_text(json.dumps({"url": "http://127.0.0.1:%d" % cfg.port, "token": cfg.token, "pid": os.getpid(), "packs": str(cfg.packs)}), "utf-8")
    url = "http://127.0.0.1:%d/app/" % cfg.port
    print("Coursekit is running at %s" % url)
    print("  code runs with: %s (Python %s)" % (cfg.python, info["pythonVersion"]))
    print("  GPU: %s" % (", ".join(info["gpu"]) if info["gpu"] else "none found (nvidia-smi not available)"))
    print("  progress is saved in: %s" % cfg.home)
    print("Press Ctrl+C to stop.")
    if not args.no_browser:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        kernels.shutdown()
        try:
            (cfg.home / "helper.json").unlink()
        except OSError:
            pass


if __name__ == "__main__":
    main()
