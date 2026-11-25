/* A stand-in for the claude.ai artifact runtime, for local tests only.
   Implements the parts of db, user, sample and downloads the player uses. */
(function () {
  const docs = new Map(); const listeners = new Set();
  window.__mockDocs = docs; window.__mockLog = [];
  const tick = () => setTimeout(() => listeners.forEach(l => l()), 5);
  // The real db hands out frozen data; so does the mock.
  const deepFreeze = o => { if (o && typeof o === "object") { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
  const snapOf = (id, body) => ({ id, exists: !!body, data: () => body && deepFreeze(JSON.parse(JSON.stringify(body))), metadata: { fromCache: false, hasPendingWrites: false } });
  function col(path, filters) {
    filters = filters || [];
    const matches = () => [...docs].filter(([k]) => k.startsWith(path + "/") && k.split("/").length === path.split("/").length + 1)
      .filter(([, b]) => filters.every(([f, op, v]) => b[f] === v)).sort((a, b) => a[0] < b[0] ? -1 : 1)
      .map(([k, b]) => snapOf(k.split("/").pop(), b));
    return {
      path,
      where: (f, op, v) => col(path, filters.concat([[f, op, v]])),
      doc: id => docRef(path + "/" + id),
      get: async () => { const d = matches(); return { docs: d, size: d.length, empty: !d.length, metadata: { fromCache: false } }; },
      onSnapshot(next) { const l = () => { const d = matches(); next({ docs: d, size: d.length, empty: !d.length, docChanges: () => [], metadata: { fromCache: false } }); }; listeners.add(l); setTimeout(l, 5); return () => listeners.delete(l); },
    };
  }
  function docRef(p) {
    return {
      id: p.split("/").pop(), path: p,
      get: async () => snapOf(p.split("/").pop(), docs.get(p)),
      set: async b => { if (JSON.stringify(b).length > 262144) throw { code: "invalid_argument", message: "too big" }; docs.set(p, JSON.parse(JSON.stringify(b))); window.__mockLog.push(["set", p]); tick(); },
      update: async b => { docs.set(p, Object.assign({}, docs.get(p), b)); tick(); },
      delete: async () => { docs.delete(p); window.__mockLog.push(["del", p]); tick(); },
      onSnapshot(next) { const l = () => next(snapOf(p.split("/").pop(), docs.get(p))); listeners.add(l); setTimeout(l, 5); return () => listeners.delete(l); },
    };
  }
  const db = { collection: p => col(p), doc: p => docRef(p) };
  const user = { id: async () => "u1", isOwner: async () => true, canEdit: async () => true, can: async () => true, me: async () => ({ id: "u1" }) };
  window.__mockJson = []; window.__mockTools = []; window.__mockCalls = [];
  async function sample(input, opts) {
    opts = opts || {}; window.__mockCalls.push({ input, tools: (opts.tools || []).map(t => t.name) });
    let text = "Here is my answer.";
    if (opts.tools && window.__mockTools.length) {
      const script = window.__mockTools.shift(); const results = [];
      for (const step of script) { const t = opts.tools.find(x => x.name === step.name); try { results.push(await t.execute(step.input, { signal: new AbortController().signal })); } catch (e) { results.push("Error: " + e.message); } }
      window.__mockToolResults = (window.__mockToolResults || []).concat(results);
      window.__mockToolResults = results; text = "Done: I made the change.";
    }
    if (opts.onText) opts.onText({ text, delta: text });
    return { text, truncated: false, modelTierApplied: "default" };
  }
  sample.json = async (input, opts) => {
    window.__mockCalls.push({ input: typeof input === "string" ? input.slice(0, 200) : input, json: true });
    const f = window.__mockJson.shift();
    if (!f) throw { code: "upstream_error", message: "no scripted answer" };
    return typeof f === "function" ? f(input) : f;
  };
  sample.limits = async () => ({ maxPromptBytes: 262144, tools: { maxCount: 16 } });
  const downloads = { save: async r => { window.__mockDownload = r; return { status: "saved" }; } };
  const caps = { db, user, sample, downloads };
  window.claude = { use: async n => caps[n] || null };
})();
