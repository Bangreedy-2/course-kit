/* Coursekit store: every record lives in the learner's private area of the
   artifact database (data/users/<id>/<key>), so it follows them to every
   device and their Claude project can read and write it.
   Keys: c~<course> course, l~<course>~<lesson> lesson, p~<course>~<lesson>
   progress, s~<course> stats, h~<course> chat, v~<course>~<time> revision,
   src~<course>~<n> source text, cmd~<id> command from the project,
   log~<yyyy-mm-dd> activity log. Every body carries "kind". */
(function (root) {
"use strict";

function dbStore(db, uid) {
  const col = db.collection("data/users/" + uid);
  const queue = new Map(); // key -> {running: Promise, next: body|undefined|DEL}
  const DEL = {};
  async function run(key) {
    const q = queue.get(key);
    while (q.next !== undefined) {
      const body = q.next; q.next = undefined;
      try {
        if (body === DEL) await col.doc(key).delete();
        else await col.doc(key).set(body);
      } catch (e) {
        if (e && e.code === "unavailable") { await new Promise(r => setTimeout(r, 400 + Math.random() * 800)); try { body === DEL ? await col.doc(key).delete() : await col.doc(key).set(body); } catch (e2) { q.error = e2; report(key, e2); } }
        else { q.error = e; report(key, e); }
      }
    }
    queue.delete(key);
  }
  let onError = null;
  function report(key, e) { if (onError) onError(key, e); }
  // Snapshot data comes back frozen; the player edits what it reads, so hand out its own copy.
  const own = v => v == null ? v : JSON.parse(JSON.stringify(v));
  function write(key, body) {
    let q = queue.get(key);
    if (q) { q.next = body; return q.running; }
    q = { next: body }; queue.set(key, q);
    q.running = run(key);
    return q.running;
  }
  return {
    kind: "db",
    put: (key, body) => write(key, JSON.parse(JSON.stringify(body))),
    del: key => write(key, DEL),
    async get(key) { const s = await col.doc(key).get(); return s.exists ? own(s.data()) : null; },
    async query(filter) { let q = col; for (const [k, v] of Object.entries(filter)) q = q.where(k, "==", v); const s = await q.get(); return s.docs.map(d => ({ key: d.id, body: own(d.data()) })); },
    watch(filter, cb, err) {
      let q = col; for (const [k, v] of Object.entries(filter)) q = q.where(k, "==", v);
      return q.onSnapshot(s => cb(s.docs.map(d => ({ key: d.id, body: own(d.data()) })), s.metadata), err);
    },
    pending: () => queue.size,
    set onError(f) { onError = f; },
  };
}

/* Browser-only fallback when the database is not available in this view. */
function localStore(prefix) {
  prefix = prefix || "ck2:";
  const mem = new Map(); const watchers = new Set();
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(prefix)) mem.set(k.slice(prefix.length), JSON.parse(localStorage.getItem(k))); } } catch (e) {}
  const match = (body, f) => Object.entries(f).every(([k, v]) => body && body[k] === v);
  function notify() { for (const w of watchers) w.fire(); }
  return {
    kind: "local",
    async put(key, body) { body = JSON.parse(JSON.stringify(body)); mem.set(key, body); try { localStorage.setItem(prefix + key, JSON.stringify(body)); } catch (e) {} setTimeout(notify, 0); },
    async del(key) { mem.delete(key); try { localStorage.removeItem(prefix + key); } catch (e) {} setTimeout(notify, 0); },
    async get(key) { return mem.has(key) ? JSON.parse(JSON.stringify(mem.get(key))) : null; },
    async query(f) { return [...mem].filter(([k, b]) => match(b, f)).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([key, body]) => ({ key, body: JSON.parse(JSON.stringify(body)) })); },
    watch(f, cb) {
      const w = { fire: () => cb([...mem].filter(([k, b]) => match(b, f)).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([key, body]) => ({ key, body: JSON.parse(JSON.stringify(body)) })), { fromCache: false }) };
      watchers.add(w); setTimeout(w.fire, 0); return () => watchers.delete(w);
    },
    pending: () => 0,
    set onError(f) {},
  };
}

const api = { dbStore, localStore };
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.CKStore = api;
})(typeof window !== "undefined" ? window : globalThis);
