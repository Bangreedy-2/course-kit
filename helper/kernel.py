"""Coursekit kernel: a persistent Python namespace driven over stdin/stdout.

The helper starts one kernel per (course, namespace) with the Python the learner
chose, so code runs with their own libraries and GPU. Protocol, one JSON object
per line:

  in:  {"code": "...", "id": 1}
  out: \x1eCK{"id": 1, "ok": true, "out": "...", "err": null, "value": "...", "imgs": ["<base64 png>"], "ms": 12}

Result lines start with the marker \x1eCK so stray output from C extensions
writing straight to the process's stdout cannot be mistaken for a result.
Standard library only.
"""
import ast
import base64
import contextlib
import io
import json
import os
import sys
import time
import traceback

os.environ.setdefault("MPLBACKEND", "Agg")

_proto = sys.stdout
_in = sys.stdin
sys.stdin = io.StringIO("")  # input() in learner code must not read the protocol
MARK = "\x1eCK"
NS = {"__name__": "__main__"}


def _figs():
    if "matplotlib.pyplot" not in sys.modules:
        return []
    import matplotlib.pyplot as plt

    out = []
    for n in plt.get_fignums():
        b = io.BytesIO()
        plt.figure(n).savefig(b, format="png", dpi=96, bbox_inches="tight")
        out.append(base64.b64encode(b.getvalue()).decode())
    plt.close("all")
    return out


def _repr(v):
    if v is None:
        return None
    try:
        import pandas as pd

        if isinstance(v, (pd.DataFrame, pd.Series)):
            with pd.option_context("display.max_rows", 60, "display.max_columns", 30, "display.width", 160):
                return repr(v)
    except Exception:
        pass
    r = repr(v)
    return r if len(r) < 20000 else r[:20000] + " …"


def run(code):
    """Execute code like a notebook cell: the value of a final expression is returned."""
    out, err = io.StringIO(), io.StringIO()
    value, error = None, None
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        try:
            tree = ast.parse(code, "<cell>", "exec")
            last = None
            if tree.body and isinstance(tree.body[-1], ast.Expr):
                last = ast.Expression(tree.body.pop().value)
            exec(compile(tree, "<cell>", "exec"), NS)
            if last is not None:
                value = _repr(eval(compile(last, "<cell>", "eval"), NS))
        except KeyboardInterrupt:
            error = "Interrupted."
        except BaseException:  # noqa: BLE001 - report everything to the learner, including SystemExit
            et, ev, tb = sys.exc_info()
            frames = [f for f in traceback.extract_tb(tb) if f.filename == "<cell>"]
            lines = ["Traceback (most recent call last):\n"]
            lines += traceback.format_list(frames)
            lines += traceback.format_exception_only(et, ev)
            error = "".join(lines)
    try:
        imgs = _figs()
    except Exception:  # noqa: BLE001
        imgs = []
    text = out.getvalue()
    if err.getvalue():
        text += err.getvalue()
    return {"ok": error is None, "out": text[-200000:], "err": error, "value": value, "imgs": imgs}


def main():
    for line in _in:
        line = line.strip()
        if not line:
            continue
        msg = json.loads(line)
        t0 = time.time()
        res = run(msg.get("code", ""))
        res["id"] = msg.get("id")
        res["ms"] = int((time.time() - t0) * 1000)
        _proto.write(MARK + json.dumps(res) + "\n")
        _proto.flush()


if __name__ == "__main__":
    main()
