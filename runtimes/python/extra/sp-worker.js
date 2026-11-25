// Sigmoid Prep Python worker: runs Pyodide off the page thread.
// Protocol in: {id, op:"run", code, fresh, files?} | {id, op:"put", path, data(ArrayBuffer|string)} | {id, op:"ls"}
// Protocol out: {id, type:"out"|"err", text} | {id, type:"img", png} | {id, type:"status", text} | {id, type:"done", ok, error, value, ms}
const base = new URL("./", self.location.href).href;
const _f = self.fetch.bind(self);
self.fetch = (u, o) => { if (typeof u === "string" || u instanceof URL) { const s = String(u); if (/\.(whl|zip)$/.test(s)) u = s + ".wasm"; } return _f(u, o); };
let py = null, cur = 0, loading = null;
const send = (m) => self.postMessage(m);
async function boot() {
  const t0 = performance.now();
  const { loadPyodide } = await import(base + "pyodide.mjs");
  py = await loadPyodide({ indexURL: base, stdout: (s) => send({ id: cur, type: "out", text: s + "\n" }), stderr: (s) => send({ id: cur, type: "err", text: s + "\n" }) });
  py.setStdout({ write: (b) => { send({ id: cur, type: "out", text: new TextDecoder().decode(b) }); return b.length; } });
  py.setStderr({ write: (b) => { send({ id: cur, type: "err", text: new TextDecoder().decode(b) }); return b.length; } });
  py.runPython(`
import os, sys, io, base64
os.environ["MPLBACKEND"] = "Agg"
os.environ["DASK_SCHEDULER"] = "synchronous"  # no threads in the browser
os.environ["DASK_DATAFRAME__CONVERT_STRING"] = "False"  # works even if pandas was imported before pyarrow
os.makedirs("/data", exist_ok=True)
os.chdir("/data")
def __sp_figs():
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
def __sp_repr(v):
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
`);
  return Math.round(performance.now() - t0);
}
const spaces = new Map(); let pdSet = false;
self.onmessage = async (e) => {
  const m = e.data; cur = m.id;
  try {
    if (!loading) loading = boot();
    const bootMs = await loading;
    if (m.op === "boot") { send({ id: m.id, type: "done", ok: true, ms: bootMs }); return; }
    if (m.op === "put") {
      const d = typeof m.data === "string" ? m.data : new Uint8Array(m.data);
      const p = m.path.startsWith("/") ? m.path : "/data/" + m.path;
      py.FS.mkdirTree(p.slice(0, p.lastIndexOf("/")) || "/");
      py.FS.writeFile(p, d);
      send({ id: m.id, type: "done", ok: true }); return;
    }
    if (m.op === "get") {
      const p = m.path.startsWith("/") ? m.path : "/data/" + m.path;
      const b = py.FS.readFile(p);
      send({ id: m.id, type: "done", ok: true, bytes: b }); return;
    }
    if (m.op === "run") {
      const t0 = performance.now();
      send({ id: m.id, type: "status", text: "Loading libraries…" });
      await py.loadPackagesFromImports(m.code, { messageCallback: () => {}, errorCallback: () => {} });
      if (/\bpandas\b/.test(m.code) && !pdSet) { try { py.runPython("import pandas as _p\n_p.set_option('display.width', 160)\n_p.set_option('display.max_columns', 30)\ndel _p"); pdSet = true; } catch (e) {} }
      send({ id: m.id, type: "status", text: "Running…" });
      let g;
      if (!m.ns) g = py.globals.get("dict")();
      else {
        g = spaces.get(m.ns);
        if (!g) { g = py.globals.get("dict")(); spaces.set(m.ns, g); }
        spaces.delete(m.ns); spaces.set(m.ns, g);
        while (spaces.size > 6) { const k = spaces.keys().next().value; spaces.get(k).destroy(); spaces.delete(k); }
      }
      g.set("__name__", "__main__");
      let value = null, error = null;
      try {
        const v = await py.runPythonAsync(m.code, { globals: g, filename: "<cell>" });
        const r = py.globals.get("__sp_repr")(v); value = r == null ? null : String(r);
        if (v && v.destroy) v.destroy();
      } catch (err) {
        error = String(err.message || err);
        const i = error.indexOf('File "<cell>"'); if (i > 0) error = "Traceback (most recent call last):\n  " + error.slice(i);
      }
      const figs = py.globals.get("__sp_figs")().toJs();
      figs.forEach((png) => send({ id: m.id, type: "img", png }));
      if (!m.ns) g.destroy();
      send({ id: m.id, type: "done", ok: !error, error, value, ms: Math.round(performance.now() - t0) });
      return;
    }
    if (m.op === "reset") { const g = spaces.get(m.ns); if (g) { g.destroy(); spaces.delete(m.ns); } try { py.runPython("import matplotlib.pyplot as _plt; _plt.close('all')" ); } catch (e) {} send({ id: m.id, type: "done", ok: true }); return; }
    if (m.op === "has") { send({ id: m.id, type: "done", ok: true, has: spaces.has(m.ns) }); return; }
  } catch (err) {
    send({ id: m.id, type: "done", ok: false, error: String(err && err.message || err) });
  }
};
