/* Coursekit runtimes: run learners' code in the page.
   Engines:
     pyodide  CPython compiled to WebAssembly, in a worker (py/ ships with the page)
     js       JavaScript in a sandboxed frame
     frame    a runner HTML document the course brings (any language that runs in a browser)
   A course maps languages to engines in course.runtimes; the rest of the page only
   calls run(lang, code) and check(lang, code, test, expect). */
(function (root) {
"use strict";
const base = p => { try { return new URL(p, document.baseURI).href; } catch (e) { return p; } };

/* ---------- runtime packs ----------
   A pack is a set of files beside the page that a runtime needs (Python lives under py/, Streamlit under st/).
   A fresh player has none; the learner's Claude copies a pack in from its public pack artifact.
   The page only checks whether a pack is there and says how to get it. */
const PACKS = {
  python: { title: "Python", probe: "py/pyodide-lock.json", ask: "Install the Python pack in my Coursekit player" },
  streamlit: { title: "Streamlit apps", probe: "st/stlite.js", ask: "Install the Streamlit pack in my Coursekit player" },
};
const packSeen = {}; const packListeners = new Set();
function packCheck(name) {
  const p = PACKS[name]; if (!p) return Promise.resolve(true);
  if (!packSeen[name]) packSeen[name] = { state: "checking", p: fetch(base(p.probe), { method: "GET", cache: "no-store" }).then(r => !!r.ok, () => false).then(ok => { packSeen[name].state = ok ? "here" : "missing"; packListeners.forEach(f => { try { f(name); } catch (e) {} }); return ok; }) };
  return packSeen[name].p;
}
const packState = name => (packSeen[name] && packSeen[name].state) || (packCheck(name), "checking");
const packHelp = name => { const p = PACKS[name]; return p.title + " is not installed in this player yet. In Claude, with the Coursekit plugin, say: “" + p.ask + "”. Then reload this page."; };
/* The packs a course needs, from its runtimes. */
function packsFor(course) { const out = []; const rts = (course && course.runtimes) || {}; for (const k of Object.keys(rts)) if (rts[k] && rts[k].engine === "pyodide") { if (!out.includes("python")) out.push("python"); if (rts[k].apps && !out.includes("streamlit")) out.push("streamlit"); } return out; }

/* ---------- Pyodide in a worker ---------- */
function pyodideEngine() {
  let w = null, seq = 0, pend = {}, state = "off", bootP = null; const listeners = new Set(); const sent = new Map();
  const setState = s => { state = s; listeners.forEach(f => { try { f(s); } catch (e) {} }); };
  function start() {
    try { w = new Worker(base("py/sp-worker.js"), { type: "module" }); } catch (e) { setState("broken"); return false; }
    w.onmessage = e => { const m = e.data, p = pend[m.id]; if (!p) return; if (m.type === "done") { delete pend[m.id]; p.res(m); } else if (p.on) p.on(m); };
    w.onerror = e => { const msg = "Python could not start" + (e && e.message ? ": " + e.message : ""); Object.values(pend).forEach(p => p.res({ ok: false, error: msg, boot: true })); pend = {}; w = null; bootP = null; setState("broken"); };
    return true;
  }
  function call(msg, on) { if (!w && !start()) return Promise.resolve({ ok: false, error: "Python is not available in this browser.", boot: true }); const id = ++seq; return new Promise(res => { pend[id] = { res, on }; w.postMessage(Object.assign({ id }, msg)); }); }
  function boot() {
    if (state === "ready") return Promise.resolve(true); if (state === "broken") return Promise.resolve(false);
    if (!bootP) { setState("loading"); bootP = call({ op: "boot" }).then(r => { if (r.ok) { setState("ready"); return true; } setState("broken"); bootP = null; return false; }); }
    return bootP;
  }
  function kill() { sent.clear(); if (w) { w.terminate(); w = null; } Object.values(pend).forEach(p => p.res({ ok: false, error: "Stopped.", stopped: true })); pend = {}; bootP = null; setState("off"); }
  async function put(name, data) { const ok = await boot(); if (!ok) return { ok: false }; return call({ op: "put", path: name, data }); }
  async function ensureFiles(code, files) {
    for (const f of files || []) {
      if (!String(code).includes(f.name) || sent.get(f.name) === f.url) continue;
      try { const r = await fetch(base(f.url)); if (!r.ok) continue; const x = await call({ op: "put", path: f.name, data: await r.arrayBuffer() }); if (x.ok) sent.set(f.name, f.url); } catch (e) {}
    }
  }
  async function run(code, o) {
    o = o || {};
    if (state !== "ready" && o.onStatus) o.onStatus("Starting Python. The first time this downloads about 45 MB; after that your browser keeps it.");
    if (!(await packCheck("python"))) return { ok: false, error: packHelp("python"), boot: true, missing: "python", out: "", imgs: [] };
    const ok = await boot(); if (!ok) return { ok: false, error: "Python did not load in this browser.", boot: true, out: "", imgs: [] };
    await ensureFiles(code, o.files);
    let out = "", timer = null; const imgs = []; const limit = o.limitMs || 60000;
    const r = await new Promise(res => {
      call({ op: "run", code, ns: o.ns || null }, m => {
        if (m.type === "out" || m.type === "err") { out += m.text; if (o.onOut) o.onOut(out); }
        else if (m.type === "img") imgs.push(m.png);
        else if (m.type === "status") { if (o.onStatus) o.onStatus(m.text); if (m.text === "Running…" && !timer) timer = setTimeout(() => { kill(); res({ ok: false, error: "Stopped: the code ran longer than " + Math.round(limit / 1000) + " s (is there a loop that never ends?). Python restarts on the next run." }); }, limit); }
      }).then(res);
    });
    clearTimeout(timer);
    return Object.assign({ out, imgs }, r);
  }
  return {
    kind: "pyodide", run, boot, kill, put,
    reset: ns => w ? call({ op: "reset", ns }) : Promise.resolve({ ok: true }),
    has: ns => w && state === "ready" ? call({ op: "has", ns }).then(r => !!r.has) : Promise.resolve(false),
    get state() { return state; }, on: f => { listeners.add(f); return () => listeners.delete(f); },
  };
}

/* ---------- frames: JavaScript and course-supplied runners ---------- */
const JS_RUNNER = `<!doctype html><meta charset="utf-8"><script>
(function(){
  var cur = 0;
  function fmt(v){ if (typeof v === "string") return v; try { var s = JSON.stringify(v); return s === undefined ? String(v) : s; } catch (e) { return String(v); } }
  function send(m){ m.ck = 1; parent.postMessage(m, "*"); }
  ["log","info","warn","error"].forEach(function(k){ console[k] = function(){ send({type:"out", id:cur, text: Array.prototype.map.call(arguments, fmt).join(" ") + "\\n"}); }; });
  addEventListener("message", function(e){
    var m = e.data; if (!m || m.ck !== 1 || m.type !== "run") return; cur = m.id;
    var v;
    try { v = (0, eval)(m.code); } catch (err) { send({type:"done", id:m.id, ok:false, error: String(err && err.stack || err).split("\\n").slice(0,4).join("\\n")}); return; }
    Promise.resolve(v).then(function(x){ send({type:"done", id:m.id, ok:true, value: x === undefined ? null : fmt(x)}); }, function(err){ send({type:"done", id:m.id, ok:false, error:String(err)}); });
  });
})();
<\/script>`;
const frameMsgs = new Map(); // window -> handler
addEventListener("message", e => { const f = frameMsgs.get(e.source); if (f && e.data && e.data.ck === 1) f(e.data); });
function frameEngine(kind, html) {
  const spaces = new Map(); let seq = 0; const pend = {};
  function make(ns) {
    const fr = document.createElement("iframe");
    fr.setAttribute("sandbox", "allow-scripts"); fr.setAttribute("aria-hidden", "true"); fr.tabIndex = -1;
    fr.style.cssText = "position:fixed;width:1px;height:1px;left:-10px;top:-10px;border:0;opacity:0;pointer-events:none";
    fr.srcdoc = html; document.body.appendChild(fr);
    const ready = new Promise(res => fr.addEventListener("load", () => res(), { once: true }));
    const sp = { fr, ready, win: null };
    ready.then(() => { sp.win = fr.contentWindow; frameMsgs.set(sp.win, m => { const p = pend[m.id]; if (!p) return; if (m.type === "done") { delete pend[m.id]; p.res(m); } else if (p.on) p.on(m); }); });
    spaces.set(ns, sp); return sp;
  }
  function drop(ns) { const sp = spaces.get(ns); if (!sp) return; if (sp.win) frameMsgs.delete(sp.win); sp.fr.remove(); spaces.delete(ns); }
  async function run(code, o) {
    o = o || {}; const ns = o.ns || "_fresh" + (++seq);
    const sp = spaces.get(ns) || make(ns); await sp.ready;
    const id = ++seq; let out = ""; const imgs = []; const limit = o.limitMs || 20000;
    const r = await new Promise(res => {
      const t = setTimeout(() => { delete pend[id]; drop(ns); res({ ok: false, error: "Stopped: the code ran longer than " + Math.round(limit / 1000) + " s. It starts fresh on the next run." }); }, limit);
      pend[id] = { res: m => { clearTimeout(t); res(m); }, on: m => { if (m.type === "out") { out += String(m.text || ""); if (o.onOut) o.onOut(out); } else if (m.type === "img" && m.png) imgs.push(String(m.png)); } };
      sp.win.postMessage({ ck: 1, type: "run", id, code: String(code), files: (o.files || []).map(f => ({ name: f.name, url: base(f.url) })) }, "*");
    });
    if (!o.ns) drop(ns);
    return { ok: !!r.ok, error: r.ok ? null : String(r.error || "Error"), value: r.value != null ? String(r.value) : null, out, imgs };
  }
  return { kind, run, boot: () => Promise.resolve(true), kill: () => { for (const k of [...spaces.keys()]) drop(k); }, put: async () => ({ ok: false }),
    reset: async ns => { drop(ns); return { ok: true }; }, has: async ns => spaces.has(ns), get state() { return "ready"; }, on: () => () => {} };
}

/* ---------- this computer: the "local" engine ----------
   Runs a program on the learner's own machine, through the player installed as a desktop app with
   permission to run programs. An add-on may register another way in LOCAL.via.
   Nothing here runs by itself: a course must be allowed by the learner first (see allow()), and the
   page never sends code the learner did not press Run on. */
const LOCAL = { provider: null, state: "off", langs: {}, note: "", desktop: null, allowed: () => false, listeners: new Set() };
const localSet = (st, note) => { LOCAL.state = st; if (note != null) LOCAL.note = note; LOCAL.listeners.forEach(f => { try { f(st); } catch (e) {} }); };
const localCmd = (l, k, win) => (win && l[k === "cmd" ? "win" : "winProbe"]) || l[k];
async function desktopExec(lang, code, o) {
  const d = LOCAL.desktop, l = CK.LOCAL_LANGS[lang]; const win = LOCAL.platform === "win32", sep = win ? "\\" : "/";
  const dir = (await d.os.tmpdir()) + sep + "coursekit-" + Math.random().toString(36).slice(2, 10);
  await d.fs.mkdir(dir, { recursive: true });
  const file = dir + sep + "main." + l.ext, exe = dir + sep + (win ? "main.exe" : "main.out"); const q = x => "\"" + x + "\"";
  await d.fs.writeFile(file, code, "utf8");
  const t0 = Date.now(); let r;
  try { r = await d.childProcess.exec(localCmd(l, "cmd", win).replace(/\{file\}/g, q(file)).replace(/\{exe\}/g, q(exe)), { cwd: dir, timeout: (o && o.limitMs) || 60000, input: o && o.stdin != null ? String(o.stdin) : undefined }); }
  finally { try { await d.fs.rm(dir, { recursive: true, force: true }); } catch (e) {} }
  const clean = x => String(x || "").split(dir + sep).join("").split(dir).join(".");
  return { ok: r.code === 0, out: clean(r.stdout), err: r.code === 0 ? "" : clean(r.stderr) || (r.signal ? "Stopped (" + r.signal + "): the code ran too long." : "Exit code " + r.code), ms: Date.now() - t0 };
}
/*ADDON<*/
/* The Coursekit runner: a local MCP server reached through the Claude desktop app. Only in the full build. */
LOCAL.via = {
  help: "Open this player in the Claude desktop app with the Coursekit runner on, then press Connect.",
  async connect(interactive) {
    const m = LOCAL.mcp || (LOCAL.mcp = window.claude && claude.use ? await claude.use("mcp").catch(() => null) : null);
    if (!(m && (interactive || LOCAL.remembered === "mcp"))) return false;
    const r = await m.callTool("host:coursekit", "runner_info", {}); const p = r && r.payload;
    if (!(p && p.languages)) return false;
    LOCAL.langs = p.languages; LOCAL.platform = p.platform; try { localStorage.setItem("ck-local", "mcp"); } catch (e) {}
    return true;
  },
  async exec(lang, code, o) {
    const r = await LOCAL.mcp.callTool("host:coursekit", "run_code", { lang, code, stdin: o && o.stdin != null ? String(o.stdin) : undefined, timeout: Math.round(((o && o.limitMs) || 60000) / 1000) });
    const p = r && r.payload; if (!p || typeof p !== "object") throw new Error("The runner gave no result.");
    return p;
  }
};
/*>ADDON*/
/* Finds a way to this computer. "interactive" means the learner just clicked, so the page may ask for permission. */
async function localConnect(interactive) {
  if (LOCAL.state === "ready") return true;
  localSet("connecting");
  try {
    const d = LOCAL.desktop || (LOCAL.desktop = window.claude && claude.use ? await claude.use("desktop").catch(() => null) : null);
    if (d && d.childProcess) {
      let st = await d.permissions.state("full-access");
      if (st === "prompt" && interactive) st = (await d.permissions.request(["full-access"]))["full-access"];
      if (st === "granted") {
        LOCAL.platform = await d.os.platform(); const win = LOCAL.platform === "win32"; LOCAL.langs = {};
        await Promise.all(Object.entries(CK.LOCAL_LANGS).map(async ([id, l]) => { try { const r = await d.childProcess.exec(localCmd(l, "probe", win), { timeout: 8000 }); if (r.code === 0) LOCAL.langs[id] = { label: l.label, version: String(r.stdout || r.stderr || "").trim().split("\n")[0].slice(0, 80) }; } catch (e) {} }));
        LOCAL.provider = "desktop"; localSet("ready", ""); try { localStorage.setItem("ck-local", "desktop"); } catch (e) {} return true;
      }
      if (st === "denied") { localSet("off", "Running programs is turned off for this app. Turn it on in the app's Permissions."); return false; }
    }
    if (LOCAL.via) {
      try { if (await LOCAL.via.connect(interactive)) { LOCAL.provider = "via"; localSet("ready", ""); return true; } }
      catch (e) { LOCAL.lastError = e && (e.code || e.message); }
    }
    localSet("off", ""); return false;
  } catch (e) { localSet("off", String(e && e.message || e)); return false; }
}
/* What to offer the learner: "install" (make this player a desktop app), "allow" (app is installed, ask permission), "none" (no way to this computer from here). */
async function localOffer() {
  const d = LOCAL.desktop || (LOCAL.desktop = window.claude && claude.use ? await claude.use("desktop").catch(() => null) : null);
  if (d && d.childProcess) return "allow";
  if (d && d.install) { try { if ((await d.install.state()) === "available") return "install"; } catch (e) {} }
  return "none";
}
function localEngine(lang) {
  const spaces = new Map();
  async function run(code, o) {
    o = o || {};
    if (!LOCAL.allowed()) return { ok: false, error: "This course is not yet allowed to run programs on this computer. Use the note at the top of the course to allow it.", boot: true, out: "", imgs: [] };
    if (LOCAL.state !== "ready" && !(await localConnect(false))) return { ok: false, error: "This lesson runs " + CK.LOCAL_LANGS[lang].label + " on your own computer, and this page is not connected to it. Use the note at the top of the course.", boot: true, out: "", imgs: [] };
    if (!LOCAL.langs[lang]) return { ok: false, error: CK.LOCAL_LANGS[lang].label + " is not installed on this computer (tried: " + CK.LOCAL_LANGS[lang].probe + "). Install it, then reload this page.", boot: true, out: "", imgs: [] };
    if (o.onStatus) o.onStatus("Running on this computer…");
    const prior = o.ns ? spaces.get(o.ns) : null; const full = prior ? prior.code + "\n" + code : code;
    let r; try { r = await (LOCAL.provider === "desktop" ? desktopExec : LOCAL.via.exec)(lang, full, o); }
    catch (e) { const msg = e && e.code === "cancelled" ? "You did not allow this run." : "This computer could not be reached: " + (e && (e.message || e.code) || e); return { ok: false, error: msg, out: "", imgs: [] }; }
    let out = String(r.out || "");
    if (prior && out.startsWith(prior.out)) out = out.slice(prior.out.length);
    if (o.ns && r.ok) spaces.set(o.ns, { code: full, out: String(r.out || "") });
    if (o.onOut) o.onOut(out);
    return { ok: !!r.ok, error: r.ok ? null : String(r.err || "Error").trim(), out, imgs: [] };
  }
  return { kind: "local", run, boot: () => localConnect(false), kill: () => {}, put: async () => ({ ok: false }), reset: async ns => { spaces.delete(ns); return { ok: true }; }, has: async ns => spaces.has(ns),
    get state() { return LOCAL.state === "ready" ? "ready" : "off"; }, on: f => { LOCAL.listeners.add(f); return () => LOCAL.listeners.delete(f); } };
}
try { LOCAL.remembered = localStorage.getItem("ck-local"); } catch (e) {}
const LOCALS = new Map();

/* ---------- registry ---------- */
let PY = null; const JS = { e: null }; const FRAMES = new Map();
const overrides = {}; // tests may register stand-in engines
function engineFor(rt) {
  if (!rt) return null;
  if (overrides[rt.engine]) return overrides[rt.engine];
  if (rt.engine === "pyodide") return PY || (PY = pyodideEngine());
  if (rt.engine === "local") { if (!LOCALS.has(rt.lang)) LOCALS.set(rt.lang, localEngine(rt.lang)); return LOCALS.get(rt.lang); }
  if (rt.engine === "js") return JS.e || (JS.e = frameEngine("js", JS_RUNNER));
  if (rt.engine === "frame") { const key = rt.lang + ":" + (rt.html || "").length + ":" + hash(rt.html || ""); if (!FRAMES.has(key)) FRAMES.set(key, frameEngine("frame", rt.html)); return FRAMES.get(key); }
  return null;
}
function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }

/* One course's view of the runtimes. */
function forCourse(course) {
  const rts = (course && course.runtimes) || {};
  const rt = lang => CK.runtimeFor(rts, lang);
  const files = () => (course && course.files) || [];
  const api = {
    has: lang => !!rt(lang) && !!engineFor(rt(lang)),
    label: lang => { const r = rt(lang); return r ? r.label : String(lang); },
    engine: lang => engineFor(rt(lang)),
    apps: () => !!(rts.python && rts.python.apps),
    async run(lang, code, o) {
      const e = engineFor(rt(lang)); if (!e) return { ok: false, error: "This course cannot run " + lang + " code.", out: "", imgs: [] };
      o = Object.assign({}, o || {}); o.files = o.files || files();
      const r = await e.run(code, o);
      return { ok: !!r.ok, error: r.ok ? null : (r.error || "Error"), out: r.out || "", value: r.value != null ? r.value : null, imgs: r.imgs || [], boot: !!r.boot };
    },
    /* Runs the learner's code, then the hidden test in the same namespace, and compares what the test prints. */
    async check(lang, code, test, expect, o) {
      o = o || {}; const e = engineFor(rt(lang)); const ns = "chk-" + Math.random().toString(36).slice(2, 9);
      const own = await api.run(lang, code, Object.assign({}, o, { ns }));
      if (!own.ok) { if (e) e.reset(ns); return { pass: false, own: own.out, err: own.error, reachedTests: false, testOut: "", imgs: own.imgs, boot: own.boot }; }
      const t = test && test.trim() ? await api.run(lang, test, Object.assign({}, o, { ns, onOut: null })) : { ok: true, out: own.out, imgs: [] };
      if (e) e.reset(ns);
      const pass = t.ok && CK.outputMatches(t.out, expect);
      return { pass, own: own.out, testOut: t.out, err: t.ok ? null : t.error, reachedTests: true, imgs: own.imgs.concat(t.imgs || []) };
    },
    reset: (lang, ns) => { const e = engineFor(rt(lang)); return e ? e.reset(ns) : Promise.resolve(); },
    has_ns: (lang, ns) => { const e = engineFor(rt(lang)); return e ? e.has(ns) : Promise.resolve(false); },
    put: (lang, name, data) => { const e = engineFor(rt(lang)); return e ? e.put(name, data) : Promise.resolve({ ok: false }); },
    state: lang => { const e = engineFor(rt(lang)); return e ? e.state : "none"; },
    on: (lang, f) => { const e = engineFor(rt(lang)); return e ? e.on(f) : () => {}; },
  };
  return api;
}

/* ---------- Streamlit apps (stlite under st/, Python from py/) ---------- */
const ST = { lock: null };
async function pkgMap() {
  if (ST.lock) return ST.lock; const m = {};
  try { const L = await (await fetch(base("py/pyodide-lock.json"))).json(); Object.entries(L.packages).forEach(([n, p]) => (p.imports || []).forEach(i => { m[i] = n; })); } catch (e) {}
  return ST.lock = m;
}
function imports(src) { const out = new Set(); String(src).replace(/^[ \t]*(?:from[ \t]+([A-Za-z_]\w*)|import[ \t]+([^\n#;]+))/gm, (_, a, b) => { if (a) out.add(a); else b.split(",").forEach(x => { const n = x.trim().split(/[\s.]/)[0]; if (n) out.add(n); }); return ""; }); return [...out]; }
async function streamlitOptions(src, files) {
  const map = await pkgMap(); const pk = [...new Set(imports(src).map(i => map[i]).filter(Boolean))];
  const f = { "app.py": src }; for (const x of files || []) if (src.includes(x.name)) f[x.name] = { url: base(x.url) };
  return { sig: pk.slice().sort().join(",") + "|" + Object.keys(f).sort().join(","), opts: { entrypoint: "app.py", pyodideUrl: base("py/pyodide.mjs"), requirements: [], prebuiltPackageNames: pk, files: f, streamlitConfig: { "client.toolbarMode": "minimal", "server.runOnSave": true } } };
}
/* Mounts a Streamlit app into `host`. Returns a controller: apply(src), restart(src), status(): {state, text}, stop(). */
function streamlit(host, src, files, onStatus) {
  const C = { frame: null, ctl: null, direct: false, hello: false, sig: "", state: "starting", ran: false, err: null, poll: null, watched: null, booted: false };
  const say = (state, text) => { C.state = state; if (onStatus) onStatus(state, text); };
  async function start(code) {
    clearInterval(C.poll); try { if (C.ctl) C.ctl.unmount(); } catch (e) {}
    host.replaceChildren(); C.frame = null; C.ctl = null; C.hello = false; C.ran = false; C.err = null;
    say("starting", "Starting Python and Streamlit. The first time takes about 20 seconds…");
    const { sig, opts } = await streamlitOptions(code, files); C.sig = sig;
    const J = JSON.stringify(opts).replace(/</g, "\\u003c");
    const fr = document.createElement("iframe"); fr.className = "stframe"; fr.title = "Streamlit app";
    const tag = "__ck" + Math.random().toString(36).slice(2, 8);
    window[tag + "hello"] = () => { C.hello = true; }; window[tag + "fail"] = e => say("error", "Streamlit could not load: " + e);
    fr.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="' + base("st/stlite.css") + '"><style>html,body{margin:0;height:100%}</style></head><body><div id="root"></div><script type="module">try{parent.' + tag + 'hello&&parent.' + tag + 'hello();}catch(e){}import("' + base("st/stlite.js") + '").then(m=>{window.__ctl=m.mount(' + J + ',document.getElementById("root"));}).catch(e=>{try{parent.' + tag + 'fail&&parent.' + tag + 'fail(String(e));}catch(x){}});<\/script></body></html>';
    host.appendChild(fr); C.frame = fr;
    setTimeout(() => { if (C.frame === fr && !C.hello) { fr.remove(); C.frame = null; direct(opts); } }, 12000);
    watch();
  }
  function direct(opts) {
    C.direct = true;
    if (!document.querySelector("link[data-stlite]")) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = base("st/stlite.css"); l.dataset.stlite = "1"; document.head.appendChild(l); }
    const div = document.createElement("div"); div.className = "stdirect"; host.appendChild(div);
    import(base("st/stlite.js")).then(m => { C.ctl = m.mount(opts, div); }).catch(e => say("error", "Streamlit could not load: " + e));
  }
  const doc = () => { try { return C.frame ? C.frame.contentDocument : host.querySelector(".stdirect"); } catch (e) { return null; } };
  const ctl = () => { try { return C.direct ? C.ctl : (C.frame && C.frame.contentWindow && C.frame.contentWindow.__ctl); } catch (e) { return null; } };
  function watch() {
    clearInterval(C.poll); let seen = 0;
    C.poll = setInterval(() => {
      const d = doc(); if (!d) return; const k = ctl();
      if (k && k !== C.watched) { C.watched = k; C.booted = false; try { k._kernel.loaded.then(() => { if (ctl() === k) C.booted = true; }); } catch (e) { C.booted = true; } }
      const txt = (d.body ? d.body.textContent : d.textContent) || "";
      if (/Error during booting up/.test(txt)) { C.err = true; C.ran = false; return say("error", "Streamlit could not start. Try Restart."); }
      const boot = txt.match(/(Loading Pyodide|Mounting files|Unpacking archives|Installing packages|Loading streamlit package|Setting up the[^.]*|Mocking some[^.]*)/);
      if (boot) { seen = 0; return say("starting", "Starting: " + boot[1].replace("Pyodide", "Python") + " (the first time takes about 20 seconds)"); }
      const ex = d.querySelector('[data-testid="stException"]'); const els = d.querySelectorAll('[data-testid="stElementContainer"]').length; const running = d.querySelector('[data-testid="stStatusWidget"]');
      if (ex) { C.err = true; C.ran = true; return say("error", "app.py raised an error: see the red box. Fix the code, then Apply."); }
      if (!C.booted) return say("starting", "Starting Python and Streamlit…");
      if (els <= 1) { seen = 0; return say("running", "Running your script. The first run imports the libraries…"); }
      if (!running) { seen++; if (seen >= 2) { C.ran = true; C.err = false; say("ready", "Running. Edit the code, then Apply to see changes."); } }
      else say("running", "Running your script…");
    }, 1000);
  }
  async function apply(code) {
    const { sig } = await streamlitOptions(code, files); const k = ctl();
    if (!k || sig !== C.sig) return start(code);
    say("running", "Applying your code…"); C.err = null;
    try { await k.writeFile("app.py", code); } catch (e) { return start(code); }
    watch();
  }
  start(src);
  return { apply, restart: start, get ran() { return C.ran; }, get err() { return C.err; }, get state() { return C.state; }, stop() { clearInterval(C.poll); try { const k = ctl(); if (k) k.unmount(); } catch (e) {} host.replaceChildren(); } };
}

const api = { local: { get state() { return LOCAL.state; }, get langs() { return LOCAL.langs; }, get provider() { return LOCAL.provider; }, get note() { return LOCAL.note; }, get lastError() { return LOCAL.lastError; }, get help() { return LOCAL.via ? LOCAL.via.help : ""; }, connect: localConnect, offer: localOffer, install: async () => { const d = LOCAL.desktop; return d && d.install ? d.install.request() : "unavailable"; }, on: f => { LOCAL.listeners.add(f); return () => LOCAL.listeners.delete(f); }, setAllowed: f => { LOCAL.allowed = f; }, uses: course => Object.entries((course && course.runtimes) || {}).filter(([, r]) => r && r.engine === "local").map(([k]) => k) }, PACKS, packCheck, packState, packHelp, packsFor, onPack: f => { packListeners.add(f); return () => packListeners.delete(f); }, forCourse, streamlit, register: (name, engine) => { overrides[name] = engine; }, JS_RUNNER };
root.CKRun = api;
})(typeof window !== "undefined" ? window : globalThis);
