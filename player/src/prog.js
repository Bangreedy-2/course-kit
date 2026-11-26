/* ================= course modules in the page =================
   Plan (weeks, tasks, done-when criteria, quizzes), Today, drills, checkpoints,
   projects, notebooks and the record. Every part is driven by the course's data;
   a course without a module simply has no tab for it. Shares scope with app.js. */

/* ---------- dates (the learner's local calendar) ---------- */
const DAY = 864e5;
function dayStr(d) { d = d || new Date(); const z = n => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); }
function parseDay(s) { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = parseDay(s); d.setDate(d.getDate() + n); return dayStr(d); }
function diffDays(a, b) { return Math.round((parseDay(b) - parseDay(a)) / DAY); }
function fmtDay(s) { return parseDay(s).toLocaleDateString(undefined, { day: "numeric", month: "short" }); }
const TODAY = () => dayStr();

/* ---------- labels ---------- */
const LABELS = { unit: "Week", lessons: "Lessons", drills: "Drills", projects: "Projects", project: "Project", checkpoint: "Checkpoint", checkpoints: "Checkpoints", today: "Today", plan: "Plan", record: "Record" };
const LBL = c => Object.assign({}, LABELS, (c && c.labels) || {});
const unitWord = c => LBL(c).unit;

/* ---------- per-course learner state: one record g~<course> ---------- */
const MASTER_BOX = 4;
function normG(b, cid) {
  const g = Object.assign({ kind: "pstate", course: cid, v: 1, start: null, crit: {}, quiz: {}, exams: {}, examRun: null, drills: {}, drafts: {}, days: {}, nb: {} }, b || {});
  for (const k of ["crit", "quiz", "exams", "drills", "drafts", "days", "nb", "docs"]) if (!g[k] || typeof g[k] !== "object") g[k] = {};
  return g;
}
let gTimer = null;
function G() {
  if (!S.g) S.g = normG(null, S.cid);
  if (!S.g.start && S.gLoaded) { const c = S.courses[S.cid]; S.g.start = (c && c.schedule && c.schedule.start) || TODAY(); saveG(); }
  return S.g;
}
const gDirty = () => !!S.gPending;
function saveG() { if (!S.store || !S.cid) return; S.gPending = true; clearTimeout(gTimer); const cid = S.cid; gTimer = setTimeout(() => flushG(cid), 500); }
const saveGSoon = saveG;
addEventListener("pagehide", () => { if (S.gPending && S.cid) { clearTimeout(gTimer); flushG(S.cid); } });
addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && S.gPending && S.cid) { clearTimeout(gTimer); flushG(S.cid); } });
async function flushG(cid) {
  if (cid !== S.cid || !S.g) return;
  const g = S.g; g.updated = new Date().toISOString(); S.gSavedAt = g.updated; S.gPending = false;
  const body = JSON.parse(JSON.stringify(g));
  if (JSON.stringify(body).length > 240000) { body.drafts = {}; if (body.examRun) for (const a of Object.values(body.examRun.ans || {})) if (a && typeof a.a === "string") a.a = a.a.slice(0, 4000); }
  await put(K.pst(cid), body);
}
function bumpDay(n) { if (!S.gLoaded) return; const g = G(); const t = TODAY(); g.days[t] = (g.days[t] || 0) + (n || 1); saveG(); }

/* ---------- time and pace ---------- */
const planOf = () => S.mods.plan || null;
const unitDays = c => (c.schedule && c.schedule.unitDays) || 7;
function curWeek(c) { const p = planOf(); if (!p) return 1; const d = diffDays(G().start || TODAY(), TODAY()); return Math.max(1, Math.min(p.weeks.length, Math.floor(d / unitDays(c)) + 1)); }
function weekRange(c, n) { const a = addDays(G().start || TODAY(), (n - 1) * unitDays(c)); return [a, addDays(a, unitDays(c) - 1)]; }
function endDate(c) { const p = planOf(); return addDays(G().start || TODAY(), (p ? p.weeks.length : 1) * unitDays(c) - 1); }
function streak() { const g = G(); let n = 0, d = TODAY(); if (!g.days[d]) d = addDays(d, -1); while (g.days[d]) { n++; d = addDays(d, -1); } return n; }
function learnedOn(lid) { const p = S.progress[lid]; return p && p.done ? dayStr(new Date(p.done)) : null; }
const learned = lid => !!(S.progress[lid] && S.progress[lid].done);
function lessonWeek(c, l) { if (l.week) return l.week; const i = c.units.findIndex(u => u.lessons.includes(l.id)); return i + 1; }
function expectedLessons(c) {
  const dd = diffDays(G().start || TODAY(), TODAY()); if (dd < 0) return 0;
  const w = Math.floor(dd / unitDays(c)) + 1; const frac = ((dd % unitDays(c)) + 1) / unitDays(c);
  let n = 0; for (const l of orderedLessons(c)) { const lw = lessonWeek(c, l); if (lw < w) n++; else if (lw === w) n += frac; } return Math.floor(n + 1e-9);
}

/* ---------- tasks and their done-when criteria ---------- */
const drillsOf = () => S.mods.drills || [];
const drillById = id => drillsOf().find(d => d.id === id);
const cpsOf = () => S.mods.checkpoints || [];
const nbOf = id => (S.mods.notebooks || {})[id];
function allTasks() { const p = planOf(); const out = []; if (p) p.weeks.forEach(w => w.tasks.forEach(t => out.push(Object.assign({ week: w.n }, t)))); return out; }
function critDone(t, k) {
  const c = t.crit[k]; const g = G(); const v = (g.crit[t.id] || {})[k];
  switch (c.t) {
    case "lesson": return learned(c.id);
    case "drill": { const d = g.drills[c.id]; return !!(d && d.passes > 0); }
    case "quiz": { const q = g.quiz[c.w]; return !!(q && q.best != null && q.best <= c.max); }
    case "checkpoint": { const x = g.exams[c.id]; const ex = cpsOf().find(e => e.id === c.id); return !!(x && ex && x.best >= ex.pass); }
    case "mastered": return Object.values(g.drills).filter(d => d && d.box >= MASTER_BOX).length >= c.n;
    case "lessons": return orderedLessons(S.courses[S.cid]).filter(l => (l.week || 1) <= c.w && !l.pending).every(l => learned(l.id));
    case "days": { const [a, b] = weekRange(S.courses[S.cid], c.w || t.week || curWeek(S.courses[S.cid])); let n = 0; for (let d = a; d <= b; d = addDays(d, 1)) if (g.days[d]) n++; return n >= c.n; }
    case "link": {
      if (t.notebook && g.nb[t.notebook] && g.nb[t.notebook].passed) return true;
      if (!v) return false;
      try { const u = new URL(v); if (!(c.hosts || []).length) return /^https?:$/.test(u.protocol); return c.hosts.some(h => u.hostname === h || u.hostname.endsWith("." + h)) && u.pathname.length > 1; } catch (e) { return false; }
    }
    case "text": {
      const tv = c.doc ? (g.docs || {})[c.doc] : v;
      if (!tv) return false; const s = String(tv);
      if (c.tpl && s.trim() === c.tpl.trim()) return false;
      if (c.lines && s.split("\n").filter(x => x.trim()).length < c.lines) return false;
      if (c.expect && !c.expect.every(e => s.toLowerCase().includes(e.toLowerCase()))) return false;
      if (c.min && CK.words(s) < c.min) return false; return true;
    }
    case "number": { if (v === undefined || v === "" || v === null) return false; const x = parseFloat(v); return !isNaN(x) && x >= c.min && x <= c.max; }
    case "check": return !!v;
  }
  return false;
}
function taskProg(t) { let d = 0; t.crit.forEach((_, k) => { if (critDone(t, k)) d++; }); return t.crit.length ? d / t.crit.length : 0; }
function overall() { let tot = 0, done = 0; for (const t of allTasks()) { if (!t.core) continue; tot += t.h; done += t.h * taskProg(t); } return tot ? done / tot : 0; }
function critLabel(c, cr) {
  const L = LBL(c);
  switch (cr.t) {
    case "lesson": return ["Lesson learned: ", h("b", null, (S.lessons[cr.id] || {}).title || cr.id), " (all practice right)"];
    case "drill": return ["Drill passed from memory: ", h("b", null, (drillById(cr.id) || {}).title || cr.id)];
    case "quiz": return L.unit + " " + cr.w + " self-check quiz with at most " + cr.max + " wrong";
    case "checkpoint": { const e = cpsOf().find(x => x.id === cr.id); return ["Pass ", h("b", null, e ? e.title : cr.id), " (" + (e ? e.pass : 70) + "% or more)"]; }
    case "mastered": return "At least " + cr.n + " drills at mastered level (passed " + MASTER_BOX + " times in a row, spaced out)";
    case "lessons": return "Every lesson up to " + L.unit.toLowerCase() + " " + cr.w + " learned";
    case "days": return "Studied on at least " + cr.n + " days this " + L.unit.toLowerCase() + " (lessons, drills, reviews and runs count)";
    default: return mdInline(cr.label || "");
  }
}

/* ---------- small pieces ---------- */
function ring(p, label) {
  const r = 10, C = 2 * Math.PI * r; const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 26 26"); s.setAttribute("class", "ring"); s.setAttribute("role", "img"); s.setAttribute("aria-label", label || Math.round(p * 100) + "% done");
  s.innerHTML = '<circle cx="13" cy="13" r="10" fill="none" stroke="var(--line)" stroke-width="3"/>' + (p >= 1
    ? '<circle cx="13" cy="13" r="10" fill="var(--ok)" stroke="var(--ok)" stroke-width="3"/><path d="M8.5 13.2l3 3 6-6.2" fill="none" stroke="var(--surface)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<circle cx="13" cy="13" r="10" fill="none" stroke="var(--accent)" stroke-width="3" stroke-dasharray="' + (C * p).toFixed(2) + " " + C.toFixed(2) + '" transform="rotate(-90 13 13)"/>');
  return s;
}
const boxes = b => h("span", { class: "boxes", title: "Box " + (b || 0) + " of 5" }, [1, 2, 3, 4, 5].map(i => h("i", { class: i <= (b || 0) ? "on" : "" })));
const pill = (text, cls) => h("span", { class: "pill " + (cls || "") }, text);
const route = (c, rest) => "#/c/" + encodeURIComponent(c.id) + (rest ? "/" + rest : "");
let timers = [];
function stopTimers() { timers.forEach(t => clearInterval(t)); timers = []; if (S.st && S.route && S.route.name !== "notebook") { try { S.st.ctl.stop(); } catch (e) {} S.st = null; } }

/* ---------- drills ---------- */
const BOX = [0, 1, 3, 7, 14, 30];
function drillUnlocked(d) { if (!d.lesson) return true; const on = learnedOn(d.lesson); return !!on && on < TODAY(); }
function dueDrills() { const t = TODAY(); const g = G(); return drillsOf().filter(d => { const s = g.drills[d.id]; return s && s.attempts > 0 && s.due <= t; }); }
function newDrills() { const g = G(); return drillsOf().filter(d => drillUnlocked(d) && !(g.drills[d.id] && g.drills[d.id].attempts > 0)); }
function lessonDrillsNote(c, l) {
  const ds = drillsOf().filter(d => d.lesson === l.id); if (!ds.length) return null;
  return h("p", { class: "muted small" }, "Its drills (" + ds.map(d => d.title).join(", ") + ") unlock the day after you learn it.");
}

/* ---------- the course's overall progress meter (design.meter) ---------- */
function courseProgress(c) {
  if (planOf()) return overall();
  const ls = orderedLessons(c); return ls.length ? ls.filter(l => learned(l.id)).length / ls.length : 0;
}
function meter(c) {
  const kind = (c.design && c.design.meter) || "bar"; const p = Math.max(0, Math.min(1, courseProgress(c))); const pct = Math.round(p * 100);
  const NS = "http://www.w3.org/2000/svg"; const svg = (w, hgt, inner) => { const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 " + w + " " + hgt); s.setAttribute("role", "img"); s.setAttribute("aria-label", "Overall progress " + pct + "%"); s.innerHTML = inner; return s; };
  const mono = 'font-family="var(--font-m)" fill="var(--muted)"';
  if (kind === "sigmoid") {
    const W = 340, H = 64, pad = 8, X = x => pad + (x + 6) / 12 * (W - 2 * pad), Y = y => H - pad - y * (H - 2 * pad), sg = x => 1 / (1 + Math.exp(-x));
    const pp = Math.min(.995, Math.max(.005, p)), xc = Math.max(-6, Math.min(6, Math.log(pp / (1 - pp))));
    let d = "", dd = ""; for (let k = 0; k <= 60; k++) { const x = -6 + k * 0.2; const pt = X(x).toFixed(1) + " " + Y(sg(x)).toFixed(1); d += (k ? "L" : "M") + pt; if (x <= xc) dd += (k ? "L" : "M") + pt; }
    return h("div", { class: "meter m-sigmoid" }, svg(W, H, '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + Y(.5) + '" y2="' + Y(.5) + '" stroke="var(--line)" stroke-dasharray="3 4"/>' +
      '<path d="' + d + '" fill="none" stroke="var(--line)" stroke-width="2.5"/><path d="' + dd + '" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="' + X(xc).toFixed(1) + '" cy="' + Y(sg(xc)).toFixed(1) + '" r="5.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>' +
      '<text x="' + (W - pad) + '" y="' + (H - 2) + '" text-anchor="end" font-size="10.5" ' + mono + '>σ(progress) = ' + pct + '%</text>'));
  }
  if (kind === "ring") {
    const r = 26, C = 2 * Math.PI * r;
    return h("div", { class: "meter m-ring" }, svg(64, 64, '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (C * p).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">' + pct + '%</text>'));
  }
  if (kind === "steps") {
    const p2 = planOf(); const n = p2 ? p2.weeks.length : c.units.length; const done = Math.round(p * n);
    return h("div", { class: "meter m-steps", role: "img", "aria-label": "Overall progress " + pct + "%" }, Array.from({ length: n }, (_, i) => h("i", { class: i < done ? "on" : "" })), h("small", null, pct + "%"));
  }
  return h("div", { class: "meter m-bar" }, h("div", { class: "bar", role: "progressbar", "aria-valuenow": pct, "aria-valuemax": 100, "aria-label": "Overall progress" }, h("i", { style: "width:" + pct + "%" })), h("small", { class: "muted" }, pct + "% overall"));
}

/* ================= course home: a dashboard with tabs ================= */
function courseTabs(c) {
  const L = LBL(c); const p = planOf(); const tabs = [];
  const tasks = allTasks();
  if (p || drillsOf().length) tabs.push(["today", L.today]);
  if (p) tabs.push(["plan", L.plan]);
  tabs.push(["lessons", L.lessons]);
  if (drillsOf().length) tabs.push(["drills", L.drills]);
  if (tasks.some(t => t.project != null || t.notebook)) tabs.push(["projects", L.projects]);
  if (p || drillsOf().length || cpsOf().length) tabs.push(["record", L.record]);
  const pages = S.mods.pages || [];
  const rec = tabs.findIndex(t => t[0] === "record");
  tabs.splice(rec < 0 ? tabs.length : rec + 1, 0, ...pages.map(pg => ["page-" + pg.id, pg.title]));
  const want = ((c.design && c.design.tabs) || []).slice();
  if (want.length) for (const pg of pages) if (!want.includes("page-" + pg.id)) want.push("page-" + pg.id);
  if (!want.length) return tabs;
  const picked = want.map(k => tabs.find(t => t[0] === k)).filter(Boolean);
  return picked.length ? picked : tabs;
}
function viewCourse(c, tab) {
  if (!S.modsLoaded || !S.gLoaded) { const w = classicHome(c); return w; }
  const tabs = courseTabs(c);
  if (tabs.length <= 1) return classicHome(c);
  const cur = tabs.find(t => t[0] === tab) ? tab : tabs[0][0];
  const wrap = h("div", { class: "course dash", "data-morph": "dash" }, dashHero(c));
  if (S.courseMenu) ap(wrap, courseMenu(c));
  ap(wrap, homeWidgets(c, "top"),
    h("nav", { class: "dtabs", "aria-label": "Course sections" }, tabs.map(([k, label]) => h("a", { href: route(c, "t/" + k), class: k === cur ? "on" : "", "aria-current": k === cur ? "page" : null }, label))));
  if (!S.courseLoaded) { ap(wrap, h("p", { class: "muted" }, "Loading lessons…")); return wrap; }
  const panel = h("section", { class: "dpanel" });
  if (cur.startsWith("page-")) tabPage(c, panel, cur.slice(5));
  else ({ today: tabToday, plan: tabPlan, lessons: tabLessons, drills: tabDrills, projects: tabProjects, record: tabRecord })[cur](c, panel);
  ap(wrap, panel, homeWidgets(c, "bottom"));
  return wrap;
}
function dashHero(c) {
  const hidden = k => ((c.design && c.design.hide) || []).includes(k);
  const p = planOf(); const L = LBL(c); const ls = orderedLessons(c);
  const got = ls.filter(l => learned(l.id)).length;
  const stats = [];
  if (p) {
    const cw = curWeek(c); const left = diffDays(TODAY(), endDate(c)); const exp = expectedLessons(c); const diff = got - exp;
    stats.push([L.unit, cw + " of " + p.weeks.length, "ends " + fmtDay(endDate(c))]);
    stats.push(["Pace", diff >= 0 ? (diff === 0 ? "On plan" : "+" + diff + " ahead") : -diff + " behind", got + "/" + ls.length + " lessons"]);
    stats.push(["Core work", Math.round(overall() * 100) + "%", left >= 0 ? left + " days left" : "finished"]);
  } else stats.push([L.lessons, got + "/" + ls.length, "learned"]);
  stats.push(["Streak", String(streak()), streak() === 1 ? "day" : "days"]);
  const due = dueCards(c).length + dueDrills().length; stats.push(["Due today", String(due), "reviews"]);
  const timeline = p && !hidden("timeline") ? h("div", { class: "timeline", role: "img", "aria-label": L.unit + " " + curWeek(c) + " of " + p.weeks.length },
    p.weeks.map(w => { const core = w.tasks.filter(t => t.core); const hrs = core.reduce((s, t) => s + t.h, 0); const pr = hrs ? core.reduce((s, t) => s + taskProg(t) * t.h, 0) / hrs : 0;
      return h("a", { href: route(c, "t/plan"), class: "tl" + (w.n === curWeek(c) ? " cur" : "") + (pr >= 1 ? " done" : ""), title: L.unit + " " + w.n + ": " + w.title + " · " + Math.round(pr * 100) + "%" }, h("i", { style: "height:" + Math.max(8, pr * 100) + "%" })); })) : null;
  return h("section", { class: "hero dhero" },
    h("div", { class: "emblem big", "aria-hidden": "true" }, c.design.emblem),
    h("div", { class: "hero-text" },
      h("div", { class: "dh-top" }, h("div", null, c.subtitle ? h("p", { class: "eyebrow" }, c.subtitle) : null, h("h1", null, c.title)), hidden("meter") ? null : meter(c)),
      hidden("stats") ? null : h("div", { class: "stats" }, stats.map(([k, v, s]) => h("div", { class: "stat" }, h("span", { class: "k" }, k), h("b", null, v), h("small", null, s)))),
      timeline,
      h("div", { class: "row" },
        h("button", { class: "btn ghost small opt-btn", "aria-expanded": String(!!S.courseMenu), onclick: () => toggleCourseMenu() }, "Course options"),
        pendingLessons(c.id).length && S.sample && !(S.writer && S.writer.running) ? h("button", { class: "btn small", onclick: () => startWriter(c.id) }, "Write " + pendingLessons(c.id).length + " waiting lessons") : null)));
}

/* Live progress handed to home widgets as window.ck.course. */
function homeData(c) {
  const p = planOf(); const ls = orderedLessons(c); const cw = p ? curWeek(c) : 0;
  const weeks = p ? p.weeks.map(w => { const core = w.tasks.filter(t => t.core); const hrs = core.reduce((s, t) => s + t.h, 0);
    const pr = hrs ? core.reduce((s, t) => s + taskProg(Object.assign({ week: w.n }, t)) * t.h, 0) / hrs : 0; const [a, b] = weekRange(c, w.n);
    return { n: w.n, title: w.title, goal: w.goal || "", progress: Math.round(pr * 1000) / 1000, current: w.n === cw, done: pr >= 1, start: a, end: b,
      tasks: w.tasks.map(t => ({ id: t.id, title: t.title, core: !!t.core, progress: Math.round(taskProg(Object.assign({ week: w.n }, t)) * 1000) / 1000 })) }; }) : [];
  const g = G();
  return { title: c.title, today: TODAY(), overall: p ? Math.round(overall() * 1000) / 1000 : (ls.length ? ls.filter(l => learned(l.id)).length / ls.length : 0),
    learned: ls.filter(l => learned(l.id)).length, lessons: ls.length, streak: streak(), due: dueCards(c).length + dueDrills().length, currentWeek: cw, weeks,
    units: c.units.map(u => ({ id: u.id, title: u.title, lessons: u.lessons.map(id => S.lessons[id]).filter(Boolean).map(l => ({ id: l.id, title: l.title, learned: learned(l.id) })) })),
    checkpoints: cpsOf().map(x => ({ id: x.id, title: x.title, pass: x.pass, best: (g.exams[x.id] || {}).best ?? null, ready: x.lessons.every(learned) })),
    drills: { total: drillsOf().length, due: dueDrills().length } };
}
/* Home widgets at one spot ("top" under the header, "bottom" under the tab's content). A widget whose document
   did not change is kept as it is when the page is patched, so it does not reload while the learner uses it. */
function homeWidgets(c, at) {
  const spot = id => (c.design.homeAt || {})[id] || "top";
  const ids = (c.design.home || []).filter(id => c.widgets && c.widgets[id] && spot(id) === at);
  if (!ids.length) return null;
  return h("div", { class: "home-widgets at-" + at, "data-morph": "hw-" + at }, ids.map(id => {
    const b = { widget: id, id: "home-" + id }; const key = "hw:" + c.id + ":" + id + ":" + hashOf(widgetDoc(c, c.widgets[id], { home: true, state: null }));
    const ph = kept(key); if (ph) return ph;
    const el = renderWidget(c, null, b); el.dataset.keep = key; return el; }));
}

/* ---------- Today ---------- */
function tabToday(c, M) {
  const hidden = k => ((c.design && c.design.hide) || []).includes(k);
  const g = G(); const L = LBL(c); const q = [];
  if (g.examRun) { const ex = cpsOf().find(e => e.id === g.examRun.id); if (ex) q.push({ ic: "CP", t: "Continue " + ex.title, d: "Timed " + L.checkpoint.toLowerCase() + " in progress · " + Math.max(0, Math.ceil((g.examRun.ends - Date.now()) / 60000)) + " min left", href: route(c, "x/" + ex.id) }); }
  const dc = dueCards(c); if (dc.length) q.push({ ic: "RC", t: "Recall cards: " + dc.length + " due", d: "Answer from memory, then reveal and judge yourself honestly", href: route(c, "review") });
  for (const d of dueDrills()) q.push({ ic: "DR", t: "Drill review: " + d.title, d: "Box " + g.drills[d.id].box + " · " + d.mins + " min budget · " + (d.tests ? "checked by running" : "self-graded"), href: route(c, "d/" + d.id) });
  if (!g.examRun) for (const ex of cpsOf()) { const got = g.exams[ex.id]; const ready = ex.lessons.every(learned); if (ready && !(got && got.best >= ex.pass)) q.push({ ic: "CP", t: ex.title + " is ready", d: ex.minutes + " min timed · pass mark " + ex.pass + "% · you can retake it", href: route(c, "x/" + ex.id) }); }
  const ls = orderedLessons(c).filter(l => !l.pending); const nl = ls.find(l => !learned(l.id));
  const lt = ls.filter(l => learnedOn(l.id) === TODAY());
  if (nl && (!lt.length || S.extraLesson === c.id)) { const started = S.progress[nl.id] && Object.keys(S.progress[nl.id].b || {}).length; const np = practiceBlocks(nl).length; q.push({ ic: "L", t: (started ? "Continue lesson: " : "New lesson: ") + nl.title, d: [L.unit + " " + lessonWeek(c, nl), nl.sub || nl.summary || "", np + " exercises"].filter(Boolean).join(" · "), href: route(c, "l/" + nl.id) }); }
  for (const d of newDrills()) q.push({ ic: "DR", t: "New drill: " + d.title, d: d.mins + " min from memory · " + (d.tests ? "checked by running" : "self-graded"), href: route(c, "d/" + d.id) });
  const left = h("div", { class: "stack" }, h("p", { class: "sec-h" }, "Today's queue · " + fmtDay(TODAY())));
  if (!q.length) ap(left, h("div", { class: "card" }, h("b", null, "Queue clear."), h("p", { class: "muted" }, nl ? "You learned a lesson today, and drills unlock tomorrow so they test memory, not copying." : "Every lesson is learned. Keep drills and recall cards going."),
    nl ? h("button", { class: "btn primary", onclick: () => { S.extraLesson = c.id; go(route(c, "l/" + nl.id)); } }, "Start another lesson anyway") : null));
  q.forEach((x, k) => ap(left, h("a", { class: "q-item" + (k === 0 ? " now" : ""), href: x.href }, h("span", { class: "ic", "aria-hidden": "true" }, x.ic), h("span", { class: "qt" }, h("b", null, x.t), h("small", null, x.d)), h("span", { class: "btn small" + (k === 0 ? " primary" : "") }, "Open"))));
  if (q.length && nl && lt.length && S.extraLesson !== c.id) ap(left, h("button", { class: "btn ghost small", onclick: () => { S.extraLesson = c.id; go(route(c, "l/" + nl.id)); } }, "Start another new lesson today"));
  const right = h("div", { class: "stack" });
  const p = planOf();
  if (p && !hidden("week")) {
    const w = p.weeks[curWeek(c) - 1];
    ap(right, h("p", { class: "sec-h" }, "This " + L.unit.toLowerCase()), h("div", { class: "card" },
      h("div", { class: "row between" }, h("h3", null, L.unit + " " + w.n + ": " + w.title), w.light ? pill("lighter " + L.unit.toLowerCase(), "due") : null),
      w.goal ? h("p", { class: "small muted" }, w.goal) : null,
      w.tasks.map(t => h("div", { class: "mini-task" }, ring(taskProg(Object.assign({ week: w.n }, t))), h("div", null, h("div", null, t.title), h("small", { class: "muted" }, (t.core ? "core" : "stretch") + " · " + t.h + " h")))),
      h("a", { class: "btn small", href: route(c, "t/plan") }, "Open the plan")));
  }
  if (!hidden("howto")) ap(right, h("p", { class: "sec-h" }, "How a study day works"), h("div", { class: "card small" }, h("ol", null,
    h("li", null, "Recall cards: say the answer before revealing it."),
    drillsOf().length ? h("li", null, "Drill reviews: write the answer from memory with the timer running.") : null,
    h("li", null, "One new lesson: read it, then answer every exercise. It counts as learned only when all are right."),
    drillsOf().length ? h("li", null, "New drills unlock the day after their lesson.") : null,
    allTasks().some(t => t.project != null) ? h("li", null, L.projects + ": do the work, then fill in the task card to tick it.") : null,
    h("li", null, "Stuck? Press Ask: " + (c.tutor.name || "your tutor") + " sees where you are."))));
  if (hidden("queue")) left.hidden = true;
  rc(M, h("div", { class: "grid2" + (hidden("queue") || !right.childElementCount ? " one" : "") }, hidden("queue") ? null : left, right.childElementCount ? right : null));
}

/* ---------- Plan and task cards ---------- */
function tabPlan(c, M) {
  const p = planOf(); const cw = curWeek(c); const L = LBL(c); const g = G();
  const phases = p.phases.length ? p.phases : [{ title: "", weeks: p.weeks.map(w => w.n) }];
  for (const ph of phases) {
    if (ph.title) ap(M, h("p", { class: "sec-h" }, ph.title + " · " + L.unit.toLowerCase() + "s " + ph.weeks[0] + "–" + ph.weeks[ph.weeks.length - 1]), ph.goal ? h("p", { class: "small muted" }, ph.goal) : null);
    for (const n of ph.weeks) {
      const w = p.weeks[n - 1]; if (!w) continue; const [a, b] = weekRange(c, n);
      const core = w.tasks.filter(t => t.core); const hrs = core.reduce((s, t) => s + t.h, 0); const prog = hrs ? core.reduce((s, t) => s + taskProg(Object.assign({ week: n }, t)) * t.h, 0) / hrs : 0;
      const stretch = w.tasks.filter(t => !t.core).reduce((s, t) => s + t.h, 0);
      const det = h("details", { class: "week" + (n === cw ? " cur" : ""), open: n === cw || (S.openWeeks && S.openWeeks.has(n)) || null, ontoggle: e => { S.openWeeks = S.openWeeks || new Set(); e.target.open ? S.openWeeks.add(n) : S.openWeeks.delete(n); } },
        h("summary", null, h("span", { class: "wk-n" }, h("small", null, L.unit.toUpperCase()), h("b", null, String(n))),
          h("span", { class: "wk-t" }, h("b", null, w.title, n === cw ? pill("now", "acc") : null, w.light ? pill("lighter", "due") : null), h("small", { class: "muted" }, fmtDay(a) + " – " + fmtDay(b) + " · core " + hrs + " h" + (stretch ? " + stretch " + stretch + " h" : ""))),
          h("span", { class: "wk-side" }, h("span", { class: "bar" }, h("i", { style: "width:" + prog * 100 + "%" })), h("small", { class: "muted" }, Math.round(prog * 100) + "%"))));
      if (w.goal) ap(det, h("p", { class: "small wk-goal" }, w.goal));
      for (const t of w.tasks) ap(det, taskCard(c, Object.assign({ week: n }, t)));
      if (w.quiz && w.quiz.length) { const qz = g.quiz[n]; ap(det, h("div", { class: "task" }, ring(qz && qz.best != null && qz.best <= w.quizMax ? 1 : 0), h("div", null, h("h4", null, L.unit + " " + n + " self-check quiz"), h("small", { class: "muted" }, w.quiz.length + " questions" + (qz ? " · best " + (w.quiz.length - qz.best) + "/" + w.quiz.length : "")), h("div", null, h("a", { class: "btn small", href: route(c, "q/" + n) }, "Take the quiz"))))); }
      ap(M, det);
    }
  }
}
/* Replacing typed text needs a second press, not a dialog. */
function confirmReplace(i) { if (i.dataset.sure) { delete i.dataset.sure; return true; } i.dataset.sure = "1"; toast("Press again to replace what you wrote with the template."); setTimeout(() => delete i.dataset.sure, 4000); return false; }
function taskCard(c, t) {
  const g = G(); const L = LBL(c);
  const rg = h("span", { class: "ringbox" }, ring(taskProg(t)));
  const card = h("div", { class: "task", "data-task": t.id }, rg);
  const body = h("div", { class: "task-b" },
    h("div", { class: "row" }, h("h4", null, t.title), pill((t.core ? "core" : "stretch") + " · " + t.h + " h", t.core ? "acc" : ""), t.track && c.tracks && c.tracks[t.track] ? pill(c.tracks[t.track]) : null, t.due ? pill("due " + fmtDay(t.due), "due") : null),
    t.desc ? mdEl(t.desc, "desc") : null,
    t.lessons ? h("div", { class: "row" }, t.lessons.map(id => h("a", { class: "btn small", href: route(c, "l/" + id) }, (learned(id) ? "✓ " : "") + ((S.lessons[id] || {}).title || id)))) : null);
  const crit = h("div", { class: "crit" }, h("p", { class: "small muted" }, h("b", null, "Done when")));
  t.crit.forEach((cr, k) => {
    const v = (g.crit[t.id] || {})[k]; const row = h("div", { class: "c" + (critDone(t, k) ? " done" : "") }, h("span", { class: "dot", "aria-hidden": "true" }));
    const inner = h("div", { class: "c-b" }, h("div", null, critLabel(c, cr)));
    const set = val => { g.crit[t.id] = g.crit[t.id] || {}; g.crit[t.id][k] = val; saveG(); row.classList.toggle("done", critDone(t, k)); rc(rg, ring(taskProg(t))); logEvent("task", { c: c.id }); };
    if (cr.t === "link" && t.notebook && nbOf(t.notebook)) ap(inner, h("div", { class: "row" }, h("a", { class: "btn small primary", href: route(c, "n/" + t.notebook) }, "📓 Open the notebook"), h("small", { class: "muted" }, g.nb[t.notebook] && g.nb[t.notebook].passed ? "Checks pass: this counts as done." : "Passing its checks counts as done. Or paste a link:")));
    if (cr.t === "link") { const i = h("input", { type: "url", placeholder: "https://" + ((cr.hosts || [])[0] || "") + "/…", value: v || "", "aria-label": cr.label }); i.addEventListener("input", () => set(i.value)); ap(inner, i, h("small", { class: "muted" }, (cr.hosts || []).length ? "Link must be on " + cr.hosts.join(" or ") : "Any https link")); }
    if (cr.t === "text") { const i = h("textarea", { class: cr.mono ? "code" : "", rows: cr.doc ? 10 : cr.mono ? 5 : 3, placeholder: cr.mono ? "Paste output here" : "Write here", "aria-label": cr.label }); i.value = (cr.doc ? (g.docs || {})[cr.doc] : v) || "";
      const setT = val => { if (cr.doc) { g.docs = g.docs || {}; g.docs[cr.doc] = val; set(val ? 1 : ""); } else set(val); };
      i.addEventListener("input", () => setT(i.value));
      if (cr.tpl) ap(inner, h("button", { class: "btn small ghost", onclick: () => { if (i.value.trim() && i.value.trim() !== cr.tpl.trim() && !confirmReplace(i)) return; i.value = cr.tpl; setT(i.value); } }, "Insert template"));
      if (cr.doc) ap(inner, h("small", { class: "muted" }, "This is one shared document: every task that asks for it edits the same text.")); ap(inner, i, h("small", { class: "muted" }, [cr.min ? "At least " + cr.min + " words." : "", cr.lines ? "At least " + cr.lines + " lines." : "", cr.expect ? "Must contain: " + cr.expect.join(", ") : ""].filter(Boolean).join(" "))); }
    if (cr.t === "number") { const i = h("input", { type: "number", step: "any", value: v == null ? "" : v, "aria-label": cr.label, style: "max-width:180px" }); i.addEventListener("input", () => set(i.value)); ap(inner, h("div", { class: "row" }, i, h("small", { class: "muted" }, (cr.unit || "") + " · expected between " + cr.min + " and " + cr.max))); }
    if (cr.t === "check") { const i = h("input", { type: "checkbox", checked: !!v || null }); i.addEventListener("change", () => set(i.checked)); ap(inner, h("label", { class: "small" }, i, " I did this")); }
    if (cr.t === "drill") ap(inner, h("a", { class: "btn small", href: route(c, "d/" + cr.id) }, "Open drill"));
    if (cr.t === "quiz") ap(inner, h("a", { class: "btn small", href: route(c, "q/" + cr.w) }, "Take the quiz"));
    if (cr.t === "checkpoint") ap(inner, h("a", { class: "btn small", href: route(c, "x/" + cr.id) }, "Open " + L.checkpoint.toLowerCase()));
    ap(row, inner); ap(crit, row);
  });
  ap(body, crit);
  if (t.res) ap(body, h("p", { class: "res small" }, "Resources: ", t.res.map(r => [h("a", { href: r[1], target: "_blank", rel: "noopener noreferrer" }, r[0]), " "])));
  ap(card, body);
  return card;
}

/* ---------- Lessons, Drills, Projects ---------- */
function tabLessons(c, M) {
  const due = dueCards(c).length; const nxt = nextLesson(c);
  ap(M, h("div", { class: "row" }, nxt ? h("a", { class: "btn primary", href: route(c, "l/" + nxt.id) }, (orderedLessons(c).some(l => learned(l.id)) ? "Continue: " : "Start: ") + nxt.title) : null, due ? h("a", { class: "btn", href: route(c, "review") }, "Review " + due + " cards") : null));
  ap(M, c.design.layout === "path" ? unitPath(c) : c.design.layout === "tabs" ? unitTabs(c) : unitList(c));
}
function tabDrills(c, M) {
  const g = G(); const L = LBL(c);
  ap(M, h("p", { class: "muted" }, "Drills are from-memory practice on a Leitner schedule: pass one and it comes back after 1, 3, 7, 14 and 30 days; miss it and it starts again tomorrow."));
  const list = h("div", { class: "card list" });
  for (const d of drillsOf()) {
    const s = g.drills[d.id]; const un = drillUnlocked(d) || (s && s.attempts);
    ap(list, h("div", { class: "lib-l" }, h("span", { class: "n" }, L.unit[0] + (d.week || "")), h("div", null, un ? h("a", { href: route(c, "d/" + d.id) }, d.title) : h("span", null, d.title), h("small", { class: "muted" }, d.mins + " min · " + (d.tests ? "run-checked" : "self-graded") + (s && s.due ? " · due " + fmtDay(s.due) : "") + (!un && d.lesson ? " · unlocks the day after " + ((S.lessons[d.lesson] || {}).title || d.lesson) : ""))), un ? boxes(s ? s.box : 0) : pill("locked")));
  }
  ap(M, list);
}
function tabPage(c, M, id) {
  const pg = (S.mods.pages || []).find(x => x.id === id); if (!pg) return;
  const tasks = allTasks().filter(t => t.page === id).sort((a, b) => (a.due || "9") < (b.due || "9") ? -1 : (a.due || "9") > (b.due || "9") ? 1 : 0);
  const done = tasks.filter(t => taskProg(t) >= 1).length;
  if (pg.facts && pg.facts.length) ap(M, h("div", { class: "facts" }, pg.facts.map(f => h("div", { class: "card" }, f.eyebrow ? h("p", { class: "eyebrow" }, f.eyebrow) : null, h("h3", null, f.title),
    h("dl", null, f.rows.map(r => [h("dt", null, r[0]), h("dd", null, mdInline(r[1]))]))))));
  if (pg.note) ap(M, h("div", { class: "card warnbox" }, mdEl(pg.note)));
  if (pg.intro) ap(M, mdEl(pg.intro));
  if (tasks.length) ap(M, h("p", { class: "sec-h" }, done + " of " + tasks.length + " done"));
  const groups = pg.groups || {}; const keys = Object.keys(groups); const used = new Set();
  for (const k of keys) { const ts = tasks.filter(t => t.group === k); if (!ts.length) continue; ts.forEach(t => used.add(t.id));
    ap(M, h("div", { class: "card row between" }, h("h3", null, groups[k]), h("span", { class: "muted small" }, ts.filter(t => taskProg(t) >= 1).length + "/" + ts.length + " done")));
    for (const t of ts) ap(M, h("div", { class: "card flush" }, taskCard(c, t))); }
  for (const t of tasks.filter(t => !used.has(t.id))) ap(M, h("div", { class: "card flush" }, taskCard(c, t)));
  if (!tasks.length && !pg.intro && !(pg.facts || []).length) ap(M, h("p", { class: "muted" }, "Nothing here yet."));
}
function tabProjects(c, M) {
  const L = LBL(c); const hw = allTasks().filter(t => t.project != null || t.notebook);
  const done = hw.filter(t => taskProg(t) >= 1).length;
  ap(M, h("div", { class: "card row between" }, h("div", null, h("h3", null, L.projects), h("p", { class: "small muted" }, L.projectsIntro || "The " + hw.length + " projects of this course, scheduled after the lessons they need.")), h("div", { class: "big-num" }, h("b", null, done + "/" + hw.length), h("small", null, "complete"))));
  const projs = (planOf() && planOf().projects) || [];
  if (projs.length) {
    for (const pr of projs) { const ts = hw.filter(t => t.project === pr.id); if (!ts.length) continue; const p = ts.reduce((s, t) => s + taskProg(t), 0) / ts.length;
      const det = h("details", { class: "week", open: (S.openProj && S.openProj.has(pr.id)) || null, ontoggle: e => { S.openProj = S.openProj || new Set(); e.target.open ? S.openProj.add(pr.id) : S.openProj.delete(pr.id); } },
        h("summary", null, ring(p), h("div", null, h("b", null, pr.title), pr.what ? h("div", { class: "small muted" }, pr.what) : null), h("span", { class: "muted small" }, ts.filter(t => taskProg(t) >= 1).length + "/" + ts.length + " steps")));
      for (const t of ts) ap(det, h("div", { class: "card flush" }, h("p", { class: "small muted pad" }, L.unit + " " + t.week), taskCard(c, t)));
      ap(M, det); }
    const rest = hw.filter(t => !projs.some(pr => pr.id === t.project));
    for (const t of rest) ap(M, h("div", { class: "card flush" }, h("p", { class: "small muted pad" }, L.unit.toLowerCase() + " " + t.week), taskCard(c, t)));
    return;
  }
  for (const t of hw) ap(M, h("div", { class: "card flush" }, h("p", { class: "small muted pad" }, (t.project != null ? L.project + " " + t.project + " · " : "") + L.unit.toLowerCase() + " " + t.week), taskCard(c, t)));
}

/* ---------- Record ---------- */
function tabRecord(c, M) {
  const g = G(); const L = LBL(c); const ls = orderedLessons(c);
  const left = h("div", { class: "stack" }), right = h("div", { class: "stack" });
  const tracks = c.tracks && Object.keys(c.tracks).length ? c.tracks : null;
  ap(left, h("p", { class: "sec-h" }, tracks ? "Tracks" : "Progress"));
  const tcard = h("div", { class: "card" });
  const groups = tracks ? Object.keys(tracks).map(k => [tracks[k], ls.filter(l => l.track === k), drillsOf().filter(d => d.track === k)]) : [[L.lessons, ls, drillsOf()]];
  for (const [name, gl, gd] of groups) { if (!gl.length && !gd.length) continue; const n = gl.filter(l => learned(l.id)).length; const m = gd.filter(d => g.drills[d.id] && g.drills[d.id].box >= 4).length;
    ap(tcard, h("div", { class: "trk" }, h("div", { class: "row between" }, h("b", null, name), h("small", { class: "muted" }, n + "/" + gl.length + " lessons" + (gd.length ? " · " + m + "/" + gd.length + " drills mastered" : ""))), h("span", { class: "bar" }, h("i", { style: "width:" + (gl.length ? n / gl.length * 100 : 0) + "%" })))); }
  ap(left, tcard);
  if (cpsOf().length) {
    ap(left, h("p", { class: "sec-h" }, L.checkpoints));
    ap(left, h("div", { class: "card scroll-x" }, h("table", { class: "list" }, h("tr", null, h("th", null, L.checkpoint), h("th", null, "Best"), h("th", null, "Attempts"), h("th")),
      cpsOf().map(ex => { const x = g.exams[ex.id]; const ready = ex.lessons.every(learned);
        return h("tr", null, h("td", null, h("b", null, ex.title), h("br"), h("small", { class: "muted" }, (ex.week ? L.unit.toLowerCase() + " " + ex.week + " · " : "") + ex.minutes + " min · pass " + ex.pass + "%")),
          h("td", null, x ? pill(x.best + "%", x.best >= ex.pass ? "ok" : "bad") : "–"), h("td", null, String(x ? x.attempts.length : 0)),
          h("td", null, g.examRun ? null : ready ? h("a", { class: "btn small", href: route(c, "x/" + ex.id) }, x ? "Retake" : "Start") : h("small", { class: "muted" }, "learn its lessons first"))); }))));
  }
  ap(left, h("p", { class: "sec-h" }, "Study days (last 10 weeks)"));
  const heat = h("div", { class: "heat", role: "img", "aria-label": "Study days heatmap" });
  const end = TODAY(); const dow = (parseDay(end).getDay() + 6) % 7; const start = addDays(end, -(69 + dow));
  for (let d = start; d <= addDays(end, 6 - dow); d = addDays(d, 1)) { const v = g.days[d] || 0; ap(heat, h("i", { class: d > end ? "" : v >= 12 ? "l3" : v >= 5 ? "l2" : v > 0 ? "l1" : "", title: d + ": " + v })); }
  ap(left, h("div", { class: "card" }, heat, h("p", { class: "small muted" }, "Each column is one week, Monday at the top. Darker means more done that day.")));
  if (drillsOf().length) {
    ap(right, h("p", { class: "sec-h" }, "Drill boxes"));
    ap(right, h("div", { class: "card scroll-x" }, h("table", { class: "list" }, h("tr", null, h("th", null, "Drill"), h("th", null, "Box"), h("th", null, "Next")),
      drillsOf().map(d => { const s = g.drills[d.id]; return h("tr", null, h("td", null, h("a", { href: route(c, "d/" + d.id) }, d.title)), h("td", null, boxes(s ? s.box : 0)), h("td", { class: "small" }, s && s.due ? fmtDay(s.due) : drillUnlocked(d) ? "new" : "locked")); }))));
  }
  ap(right, h("p", { class: "sec-h" }, "Settings"));
  const startIn = h("input", { type: "date", value: g.start || TODAY() });
  startIn.addEventListener("change", () => { if (startIn.value) { g.start = startIn.value; saveG(); S.gRev = (S.gRev || 0) + 1; S.view = null; render(); } });
  const restore = h("textarea", { class: "code", rows: 4, hidden: true, placeholder: "Paste a progress backup here, then press Restore again" });
  const rts = Object.entries(c.runtimes || {});
  ap(right, h("div", { class: "card stack small" },
    planOf() ? h("label", null, "Course start ", startIn) : null,
    h("div", { class: "row" },
      h("button", { class: "btn small", onclick: () => saveBackup(c) }, "Save progress backup"),
      h("button", { class: "btn small", onclick: () => { if (restore.hidden || !restore.value.trim()) { restore.hidden = false; restore.focus(); return; } restoreBackup(c, restore.value).then(n => { toast("Progress restored (" + n + " records)."); restore.value = ""; restore.hidden = true; }, e => toast("That is not a progress backup: " + (e.message || e), "bad")); } }, "Restore from backup")),
    restore,
    h("p", { class: "muted" }, S.mode === "db" ? "Progress is saved to your Claude account and follows you to every device. A backup file is a copy you keep." : "Progress is saved in this browser only. Save a backup to move it."),
    rts.length ? h("div", null, h("b", null, "Code runs here"), h("ul", null, rts.map(([lang, r]) => h("li", null, r.label + " (" + ({ pyodide: "CPython in this browser", js: "JavaScript in a sandbox", frame: "the course's own runner" }[r.engine] || r.engine) + ")" + (lang === "python" && r.apps ? ", Streamlit apps" : ""))))) : null,
    (c.files || []).length ? h("div", null, h("b", null, "Data files"), h("p", { class: "muted" }, c.files.map(f => f.name).join(", "))) : null));
  rc(M, h("div", { class: "grid2" }, left, right));
}
/* Backups hold this course's progress records: lessons, programme state and notebooks. */
async function saveBackup(c) {
  const out = { coursekitProgress: 2, course: c.id, saved: new Date().toISOString(), progress: Object.values(S.progress).map(p => { const b = Object.assign({}, p); delete b._dirty; return b; }), state: G(), notebooks: [] };
  const nbs = await S.store.query({ kind: "nbwork", course: c.id }).catch(() => []); out.notebooks = nbs.map(d => d.body);
  const data = JSON.stringify(out); const name = c.id + "-progress-" + TODAY() + ".json";
  if (S.downloads) { try { await S.downloads.save({ filename: name, data }); return; } catch (e) { if (e && e.code === "cancelled") return; } }
  copy(data);
}
async function restoreBackup(c, text) {
  const o = JSON.parse(text);
  if (o && o.coursekitProgress === 2) {
    let n = 0;
    for (const p of o.progress || []) { if (!p.lesson) continue; p.course = c.id; p.kind = "progress"; S.progress[p.lesson] = p; await put(K.prog(c.id, p.lesson), p); n++; }
    if (o.state) { S.g = normG(Object.assign({}, o.state, { course: c.id }), c.id); await flushG(c.id); n++; }
    for (const nb of o.notebooks || []) { nb.course = c.id; await put(K.nbw(c.id, nb.nb), nb); n++; }
    S.gRev = (S.gRev || 0) + 1; S.view = null; render(); return n;
  }
  // A progress backup from Coursekit 1: lessons by practice index.
  if (o && o.lessons && o.prac) { const r = CK.fromV1Progress(o, S.lessons, c.id); for (const p of r.progress) { S.progress[p.lesson] = p; await put(K.prog(c.id, p.lesson), p); } S.g = normG(r.state, c.id); await flushG(c.id); S.gRev = (S.gRev || 0) + 1; S.view = null; render(); return r.progress.length + 1; }
  throw new Error("unknown format");
}

/* ================= drill ================= */
function viewDrill(c, id) {
  if (!S.modsLoaded || !S.gLoaded) return h("p", { class: "muted" }, "Loading…");
  const d = drillById(id); const L = LBL(c);
  if (!d) return h("div", { class: "empty" }, h("h2", null, "No such drill"), h("a", { href: route(c, "t/drills") }, "Back"));
  const g = G(); const s = g.drills[d.id] || { box: 0, attempts: 0, passes: 0 };
  const wrap = h("article", { class: "lesson drill" },
    h("p", { class: "crumbs" }, h("a", { href: route(c, "t/" + (courseTabs(c).some(t => t[0] === "today") ? "today" : "drills")) }, "← Back"), " · Drill" + (d.track && c.tracks && c.tracks[d.track] ? " · " + c.tracks[d.track] : "") + (d.level ? " · level " + d.level : "")),
    h("h1", null, d.title),
    h("p", { class: "row small muted" }, boxes(s.box), " Box " + s.box + " · " + (d.tests ? "checked by running" : "self-graded") + " · " + s.passes + " passes" + (s.due ? " · next due " + fmtDay(s.due) : "")));
  if (!(drillUnlocked(d) || s.attempts > 0)) { ap(wrap, h("div", { class: "card" }, "This drill unlocks the day after you learn ", h("a", { href: route(c, "l/" + d.lesson) }, (S.lessons[d.lesson] || {}).title || d.lesson), ". Waiting a day means it tests memory, not copying.")); return wrap; }
  const timer = h("span", { class: "timer", role: "timer" }, "00:00 / " + d.mins + ":00");
  const hints = h("div"); let hn = 0;
  const hintBtn = h("button", { class: "btn small", disabled: !d.hints.length || null, onclick: () => { if (hn < d.hints.length) { ap(hints, h("div", { class: "hintbox" }, mdInline(d.hints[hn]))); hn++; } if (hn >= d.hints.length) hintBtn.disabled = true; } }, "Show a hint (" + d.hints.length + ")");
  const text = d.format === "text" || !d.tests && !(d.lang && RT().has(d.lang));
  const draft = g.drafts["d:" + d.id];
  const ta = text ? h("textarea", { class: "prosebox", rows: 8, placeholder: "Write from memory", "aria-label": "Your answer" }) : codeArea(draft != null ? draft : (d.starter || ""), d.lang);
  if (text) ta.value = draft != null ? draft : "";
  ta.addEventListener("input", () => { g.drafts["d:" + d.id] = ta.value; saveG(); });
  const out = h("div", { class: "runout" });
  const grade = gr => {
    const s2 = g.drills[d.id] || { box: 0, attempts: 0, passes: 0 }; s2.attempts++; s2.last = TODAY();
    if (gr === "fail") { s2.box = 0; s2.due = addDays(TODAY(), 1); } else if (gr === "hard") { s2.box = Math.max(1, s2.box); s2.due = addDays(TODAY(), BOX[s2.box]); s2.passes++; } else { s2.box = Math.min(5, s2.box + 1); s2.due = addDays(TODAY(), BOX[s2.box]); s2.passes++; }
    g.drills[d.id] = s2; delete g.drafts["d:" + d.id]; logEvent("drill", { c: c.id, d: d.id, g: gr }); saveG();
    toast(gr === "fail" ? "Back to box 0. It returns tomorrow." : "Moved to box " + s2.box + ". Next review " + fmtDay(s2.due) + ".", "ok");
    S.gRev = (S.gRev || 0) + 1; go(route(c, "t/" + (courseTabs(c).some(t => t[0] === "today") ? "today" : "drills")));
  };
  const showModel = (note, passed) => rc(out, note || null, h("p", { class: "sec-h" }, "Model answer"), text ? mdEl(d.solution) : h("pre", { "data-lang": d.lang || "" }, h("code", null, d.solution)),
    h("p", { class: "small" }, "How did it go?"), h("div", { class: "row" }, passed ? null : h("button", { class: "btn", onclick: () => grade("fail") }, "Failed"), h("button", { class: "btn", onclick: () => grade("hard") }, "Got it, but it was hard"), h("button", { class: "btn primary", onclick: () => grade("good") }, "Got it")));
  const btns = h("div", { class: "row" });
  if (d.tests && RT().has(d.lang)) ap(btns,
    h("button", { class: "btn primary", onclick: async () => { rc(out, statusLine("Running the hidden tests…")); const r = await RT().check(d.lang, ta.value, d.tests, d.expect, { onStatus: t => rc(out, statusLine(t)) });
      if (r.pass) showModel(h("p", { class: "ok" }, "All tests pass. Compare your version with the model answer, then record it."), true);
      else rc(out, runOutput({ out: r.own, error: r.err, imgs: r.imgs }, null), h("div", { class: "fb" }, h("p", { class: "bad" }, r.err ? "Error while running." : "Tests ran but the output differs."), r.reachedTests && !r.err ? h("pre", { class: "out" }, r.testOut) : null, h("p", { class: "small" }, "Fix it and try again, or give up and compare."))); } }, "Run and check"),
    h("button", { class: "btn", onclick: async () => { rc(out, statusLine("Running…")); const r = await RT().run(d.lang, ta.value, { onStatus: t => rc(out, statusLine(t)) }); rc(out, runOutput(r, "(no output)")); } }, "Run only"));
  ap(btns, h("button", { class: "btn" + (d.tests ? " ghost" : " primary"), onclick: () => showModel() }, d.tests ? "Give up and compare" : "Compare with the model answer"));
  ap(wrap, h("div", { class: "q" }, mdEl(d.prompt)), h("div", { class: "row between" }, timer, hintBtn), hints, ta, btns, out);
  const t0 = Date.now();
  timers.push(setInterval(() => { if (!timer.isConnected) return; const sec = Math.floor((Date.now() - t0) / 1000); timer.textContent = String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0") + " / " + d.mins + ":00"; timer.classList.toggle("over", sec > d.mins * 60); }, 1000));
  return wrap;
}

/* ================= checkpoints ================= */
function examItems(ex) {
  return ex.items.map(ref => {
    if (ref.startsWith("drill:")) return { ref, kind: "drill", d: drillById(ref.slice(6)) };
    const [lid, bid] = ref.split(":"); const l = lid === "own" ? { id: "cp-" + ex.id, title: ex.title, blocks: ex.blocks || [] } : S.lessons[lid]; const b = l && (l.blocks || []).find(x => x.id === bid);
    return { ref, kind: "block", l, b };
  }).filter(it => it.kind === "drill" ? it.d : it.b);
}
function examScore(ex, run) { const items = examItems(ex); let pts = 0; for (const it of items) { const a = run.ans[it.ref]; if (a && a.ok) pts++; } return items.length ? Math.round(pts / items.length * 100) : 0; }
function finishExam(c, timeout) {
  const g = G(); const run = g.examRun; if (!run) return;
  const ex = cpsOf().find(e => e.id === run.id); const sc = ex ? examScore(ex, run) : 0;
  const x = g.exams[run.id] || { best: 0, attempts: [] }; x.attempts.push({ date: TODAY(), score: sc }); x.best = Math.max(x.best, sc); g.exams[run.id] = x;
  g.examRun = null; logEvent("exam", { c: c.id, x: run.id, score: sc }); saveG();
  toast((timeout ? "Time is up. " : "") + "Score " + sc + "%" + (ex && sc >= ex.pass ? ", passed." : ex ? ", the pass mark is " + ex.pass + "%." : "."), sc >= (ex ? ex.pass : 70) ? "ok" : "bad");
  S.gRev = (S.gRev || 0) + 1; go(route(c, "t/record"));
}
function viewExam(c, id) {
  if (!S.modsLoaded || !S.gLoaded || !S.courseLoaded) return h("p", { class: "muted" }, "Loading…");
  const ex = cpsOf().find(e => e.id === id); const L = LBL(c); const g = G();
  if (!ex) return h("div", { class: "empty" }, h("h2", null, "No such " + L.checkpoint.toLowerCase()), h("a", { href: route(c) }, "Back"));
  const back = route(c, "t/" + (courseTabs(c).some(t => t[0] === "today") ? "today" : "record"));
  if (g.examRun && g.examRun.id !== id) return h("div", { class: "empty" }, h("h2", null, "Another " + L.checkpoint.toLowerCase() + " is running"), h("a", { class: "btn", href: route(c, "x/" + g.examRun.id) }, "Go to it"));
  if (g.examRun && Date.now() > g.examRun.ends) { setTimeout(() => finishExam(c, true), 0); return h("p", { class: "muted" }, "Time is up. Marking…"); }
  const items = examItems(ex);
  if (!g.examRun) {
    const ready = ex.lessons.every(learned); const x = g.exams[ex.id];
    return h("article", { class: "lesson exam" }, h("p", { class: "crumbs" }, h("a", { href: back }, "← Back")), h("h1", null, ex.title),
      h("p", { class: "lede" }, items.length + " items · " + ex.minutes + " minutes · pass mark " + ex.pass + "%"),
      ex.intro ? mdEl(ex.intro) : null,
      x ? h("p", null, "Best so far: ", pill(x.best + "%", x.best >= ex.pass ? "ok" : "bad"), " after " + x.attempts.length + " attempt" + (x.attempts.length > 1 ? "s" : "") + ".") : null,
      h("p", { class: "muted" }, "Timed and closed-book: no notes, no lessons, and Ask is off until you submit. Answers save as you go and are marked when you submit or when time runs out."),
      ready ? null : h("p", { class: "note" }, "Learn its lessons first: " + ex.lessons.filter(l => !learned(l)).map(l => (S.lessons[l] || {}).title || l).join(", ") + "."),
      h("button", { class: "btn primary", disabled: !ready || null, onclick: () => { g.examRun = { id: ex.id, started: Date.now(), ends: Date.now() + ex.minutes * 60000, ans: {} }; saveG(); S.gRev = (S.gRev || 0) + 1; S.view = null; render(); } }, x ? "Retake it now" : "Start the timer"));
  }
  const run = g.examRun;
  const timer = h("span", { class: "timer", role: "timer" });
  const wrap = h("article", { class: "lesson exam" },
    h("p", { class: "crumbs" }, h("a", { href: back }, "← Leave (the timer keeps running)")), h("h1", null, ex.title),
    h("div", { class: "exam-bar" }, timer, h("button", { class: "btn primary", onclick: () => finishExam(c, false) }, "Submit")),
    h("p", { class: "muted small" }, items.length + " items. Answers are saved as you go and marked when you submit."));
  items.forEach((it, i) => {
    const num = "Q" + (i + 1);
    if (it.kind === "block") ap(wrap, renderBlock(c, it.l, it.b, { ans: run.ans, key: it.ref, num }));
    else ap(wrap, examDrill(c, it.d, run, it.ref, num));
  });
  const tick = () => { const left = Math.max(0, run.ends - Date.now()); timer.textContent = String(Math.floor(left / 60000)).padStart(2, "0") + ":" + String(Math.floor(left / 1000) % 60).padStart(2, "0") + " left"; timer.classList.toggle("over", left < 60000); if (left <= 0 && S.g && S.g.examRun === run) finishExam(c, true); };
  tick(); timers.push(setInterval(tick, 1000));
  return wrap;
}
function examDrill(c, d, run, ref, num) {
  const st = run.ans[ref] || {}; const box = h("section", { class: "blk practice exam-item" }, h("p", { class: "qnum" }, num + " · from memory"), h("div", { class: "q" }, mdEl(d.prompt)));
  const o = h("div", { class: "fb" });
  if (d.tests && RT().has(d.lang)) {
    const ta = codeArea(st.a != null ? st.a : (d.starter || ""), d.lang); ta.addEventListener("input", () => { run.ans[ref] = Object.assign(run.ans[ref] || {}, { a: ta.value }); saveG(); });
    ap(box, ta, h("div", { class: "row" }, h("button", { class: "btn small primary", onclick: async () => { rc(o, statusLine("Running…")); const r = await RT().check(d.lang, ta.value, d.tests, d.expect, { onStatus: t => rc(o, statusLine(t)) }); run.ans[ref] = { a: ta.value, ok: r.pass }; saveG(); rc(o, h("p", { class: "muted" }, r.pass ? "Tests pass. Saved." : "Tests do not pass yet. Saved.")); } }, "Run and check")), o);
  } else {
    const ta = h("textarea", { class: "prosebox", rows: 6, "aria-label": "Your answer" }); ta.value = st.a || "";
    ta.addEventListener("input", () => { run.ans[ref] = Object.assign(run.ans[ref] || {}, { a: ta.value }); saveG(); });
    ap(box, ta, h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => rc(o, h("pre", { class: "out wrap" }, d.solution), h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => { run.ans[ref] = { a: ta.value, ok: false }; saveG(); rc(o, h("p", { class: "muted" }, "Marked wrong. Saved.")); } }, "I got it wrong"), h("button", { class: "btn small primary", onclick: () => { run.ans[ref] = { a: ta.value, ok: true }; saveG(); rc(o, h("p", { class: "muted" }, "Marked right. Saved.")); } }, "I got it right"))) }, "Compare with the model answer")), o);
  }
  return box;
}

/* ================= weekly quiz ================= */
function viewQuiz(c, n) {
  if (!S.modsLoaded || !S.gLoaded) return h("p", { class: "muted" }, "Loading…");
  const p = planOf(); const w = p && p.weeks[n - 1]; const L = LBL(c);
  if (!w || !w.quiz) return h("div", { class: "empty" }, h("h2", null, "No quiz here"), h("a", { href: route(c, "t/plan") }, "Back to the plan"));
  const picks = {}; let done = false;
  const wrap = h("article", { class: "lesson quiz" }, h("p", { class: "crumbs" }, h("a", { href: route(c, "t/plan") }, "← Plan")), h("h1", null, L.unit + " " + n + " self-check"),
    h("p", { class: "lede" }, w.quiz.length + " questions. Pass with at most " + w.quizMax + " wrong. You can retake it."));
  const items = w.quiz.map((q, i) => {
    const fb = h("div", { class: "fb" });
    const opts = q.o.map((o, j) => h("button", { class: "opt", "aria-pressed": "false", onclick: e => { if (done) return; picks[i] = j; opts.forEach(x => x.setAttribute("aria-pressed", "false")); e.currentTarget.setAttribute("aria-pressed", "true"); } }, mdInline(o)));
    ap(wrap, h("section", { class: "blk practice" }, h("div", { class: "q" }, h("p", null, h("b", null, (i + 1) + ". "), mdInline(q.q))), h("div", { class: "opts" }, opts), fb));
    return { q, opts, fb };
  });
  const res = h("div");
  ap(wrap, h("button", { class: "btn primary", onclick: () => {
    if (done) return; if (w.quiz.some((_, i) => picks[i] == null)) { toast("Answer every question first."); return; }
    done = true; let wrong = 0; const g = G();
    items.forEach((it, i) => { it.opts.forEach((b, j) => { if (j === it.q.a) b.classList.add("right"); else if (j === picks[i]) b.classList.add("wrong"); }); if (picks[i] !== it.q.a) wrong++; rc(it.fb, h("p", { class: picks[i] === it.q.a ? "ok" : "bad" }, picks[i] === it.q.a ? "Right." : "Not this one."), it.q.why ? mdEl(it.q.why) : null); });
    const prev = g.quiz[n]; g.quiz[n] = { best: prev && prev.best != null ? Math.min(prev.best, wrong) : wrong, last: wrong }; logEvent("quiz", { c: c.id, w: n, wrong }); saveG();
    rc(res, h("div", { class: "card" }, h("b", null, (w.quiz.length - wrong) + " of " + w.quiz.length + " right. "), wrong <= w.quizMax ? "Passed." : "Not passed yet. Read the explanations and retake it tomorrow."));
  } }, "Submit answers"), res);
  return wrap;
}

/* ================= notebooks ================= */
const NB = { exec: {}, imgs: {}, n: 0 };
const nbRand = () => "c" + Math.random().toString(36).slice(2, 8);
function nbFromTemplate(T) { return { cells: T.cells.map(x => ({ id: nbRand(), t: x.t, src: x.src, tag: x.tag || null, out: null })), files: [], tplv: T.v || 1 }; }
async function nbLoad(c, id) {
  if (S.nbw[id]) return S.nbw[id];
  const T = nbOf(id); let doc = null;
  try { doc = await S.store.get(K.nbw(c.id, id)); } catch (e) {}
  const nb = doc && Array.isArray(doc.cells) ? { cells: doc.cells, files: doc.files || [], tplv: doc.tplv || 1 } : nbFromTemplate(T);
  return S.nbw[id] = nb;
}
let nbTimers = {};
function nbSave(c, id) {
  const nb = S.nbw[id]; if (!nb) return; clearTimeout(nbTimers[id]);
  nbTimers[id] = setTimeout(() => {
    const cells = nb.cells.map(x => ({ id: x.id, t: x.t, src: x.src, tag: x.tag || null, out: x.out ? { text: String(x.out.text || "").slice(-6000), err: x.out.err ? String(x.out.err).slice(0, 3000) : null, value: x.out.value != null ? String(x.out.value).slice(0, 3000) : null } : null }));
    let body = { kind: "nbwork", course: c.id, nb: id, cells, files: nb.files.map(f => ({ name: f.name, url: f.url || null })), tplv: nb.tplv, updated: new Date().toISOString() };
    if (JSON.stringify(body).length > 240000) body.cells = cells.map(x => Object.assign({}, x, { out: null }));
    put(K.nbw(c.id, id), body);
  }, 900);
}
const nbWords = src => CK.words(String(src || "").split("\n").filter(l => !/^\s*#/.test(l) && !/^\s*_[^_].*_\s*$/.test(l)).join(" "));
const nbAnswer = src => String(src || "").split("\n").filter(l => !/^\s*#/.test(l) && !/^\s*_[^_].*_\s*$/.test(l)).join("\n").trim();
function nbFiles(c, nb) { return (c.files || []).concat(nb.files.filter(f => f.url).map(f => ({ name: f.name, url: f.url }))); }
function viewNotebook(c, id) {
  if (!S.modsLoaded || !S.gLoaded) return h("p", { class: "muted" }, "Loading…");
  const T = nbOf(id); const L = LBL(c);
  if (!T) return h("div", { class: "empty" }, h("h2", null, "No such notebook"), h("a", { href: route(c, "t/projects") }, "Back"));
  const wrap = h("article", { class: "nbwrap" }, h("p", { class: "muted" }, "Opening the notebook…"));
  nbLoad(c, id).then(nb => { if (S.route.name === "notebook" && S.route.id === id) rc(wrap, ...nbPaint(c, id, nb)); });
  return wrap;
}
function nbPaint(c, id, nb) {
  const T = nbOf(id); const L = LBL(c); const g = G(); const ns = "nb:" + id; const lang = T.lang || "python";
  const task = allTasks().find(t => t.notebook === id);
  const status = pill(g.nb[id] && g.nb[id].passed ? "All checks pass" : "Checks not passed yet", g.nb[id] && g.nb[id].passed ? "ok" : "");
  const checks = h("div", { id: "nbchecks" }); const cellsEl = h("div", { class: "nbcells" });
  const can = RT().has(lang);
  const paintChecks = r => {
    if (!r) { const st = g.nb[id] || {}; rc(checks, h("details", { class: "card nbck" }, h("summary", null, h("b", null, T.checks.length + " checks"), " ", h("small", { class: "muted" }, st.score ? "last run " + fmtDay(st.last) + ": " + st.score + " passed" : "press Check my work when you think you are done")), h("ul", { class: "nbcklist" }, T.checks.map(x => h("li", null, h("span", { class: "dot" }), mdInline(x.label)))))); return; }
    if (r.error) { rc(checks, h("div", { class: "card nbck" }, h("p", { class: "bad" }, r.error))); return; }
    rc(checks, h("div", { class: "card nbck" }, h("div", { class: "row between" }, h("b", null, r.all ? "All checks pass." + (task ? " The notebook criterion of its task is done." : "") : r.results.filter(x => x.ok).length + " of " + r.results.length + " checks pass"), task ? h("a", { class: "btn small", href: route(c, "t/projects") }, "See the task card") : null),
      h("ul", { class: "nbcklist" }, T.checks.map((x, k) => { const y = r.results[k]; return h("li", { class: y.ok ? "ok" : "no" }, h("span", { class: "dot" }), h("div", null, mdInline(x.label), !y.ok && y.why ? h("small", { class: "muted" }, y.why) : null)); })),
      r.filled ? h("p", { class: "small muted" }, "Copied " + r.filled + " of your results and answers into the task card.") : null));
    status.className = "pill " + (g.nb[id] && g.nb[id].passed ? "ok" : ""); status.textContent = g.nb[id] && g.nb[id].passed ? "All checks pass" : "Checks not passed yet";
  };
  const runCell = async (x, el) => {
    if (x.t !== "code" || x.tag === "app") return true;
    const outEl = el.querySelector(".nbout"); el.classList.add("running"); rc(outEl, statusLine("Running…"));
    const r = await RT().run(lang, x.src, { ns, limitMs: 180000, files: nbFiles(c, nb), onStatus: t => rc(outEl, statusLine(t)), onOut: t => rc(outEl, h("pre", { class: "out" }, t.slice(-20000))) });
    el.classList.remove("running");
    if (r.boot) { rc(outEl, h("p", { class: "bad" }, "Python could not start in this browser, so the notebook cannot run here. Export it and run it in Jupyter or Colab instead.")); return false; }
    NB.exec[x.id] = ++NB.n; NB.imgs[x.id] = r.imgs || [];
    x.out = { text: (r.out || "").slice(-20000), err: r.ok ? null : String(r.error || "Error").slice(0, 6000), value: r.value != null ? String(r.value).slice(0, 8000) : null };
    nbSave(c, id); el.querySelector(".nbn").textContent = "[" + NB.exec[x.id] + "]"; rc(outEl, nbOut(x)); logEvent("nbrun", { c: c.id });
    return r.ok;
  };
  const runAll = async () => { const els = [...cellsEl.children]; for (let i = 0; i < nb.cells.length; i++) { const x = nb.cells[i]; if (x.t !== "code" || x.tag === "app") continue; if (els[i]) els[i].scrollIntoView({ block: "nearest" }); if (!(await runCell(x, els[i]))) { toast("Stopped at an error in cell " + (i + 1) + "."); return false; } } return true; };
  const paintCells = () => rc(cellsEl, nb.cells.map((x, i) => nbCell(c, id, nb, x, i, paintCells, runCell)));
  const check = async btn => {
    btn.disabled = true; rc(checks, h("div", { class: "card nbck" }, h("p", { class: "muted" }, "Checking…")));
    try {
      if (!(await RT().has_ns(lang, ns))) { rc(checks, h("div", { class: "card nbck" }, h("p", { class: "muted" }, "Python has none of your variables yet, so every cell runs first…"))); if (!(await runAll())) return paintChecks({ error: "A cell raised an error, so the checks could not run. Fix that cell first." }); }
      const py = [], pyIdx = []; T.checks.forEach((x, k) => { if (typeof x.test === "string") { py.push(x.test); pyIdx.push(k); } });
      const vals = {}; Object.entries(T.fill || {}).forEach(([k, f]) => { if (typeof f === "string") vals[k] = f; });
      const code = "import json as __ck_json\ndef __ck_c(src):\n    try:\n        return bool(eval(src, globals()))\n    except Exception as e:\n        return 'ERR:' + type(e).__name__ + ': ' + str(e)[:200]\ndef __ck_v(src):\n    try:\n        v = eval(src, globals())\n    except Exception:\n        return None\n    if isinstance(v, str):\n        return v\n    try:\n        return float(v)\n    except Exception:\n        return str(v)\nprint('@@NBCHK@@' + __ck_json.dumps({'c': [__ck_c(s) for s in " + JSON.stringify(py) + "], 'v': {k: __ck_v(s) for k, s in " + JSON.stringify(vals) + ".items()}}))\n";
      const app = nb.cells.find(x => x.tag === "app");
      const pre = "import numpy as np\ntry:\n    import pandas as pd\nexcept Exception:\n    pass\n" + (app ? "import json as __ck_json\nAPP_SRC = __ck_json.loads(" + JSON.stringify(JSON.stringify(app.src)) + ")\n" : "") + (T.prelude || "") + "\n";
      const r = await RT().run(lang, pre + code, { ns, limitMs: 120000 });
      let res = null; const m = (r.out || "").split("@@NBCHK@@")[1]; if (m) { try { res = JSON.parse(m.trim().split("\n")[0]); } catch (e) {} }
      if (!res) return paintChecks({ error: "The checker could not run: " + (r.error || "no result") });
      const figs = nb.cells.reduce((n, x) => n + (NB.imgs[x.id] || []).length, 0);
      const results = T.checks.map((x, k) => {
        if (typeof x.test === "string") { const v = res.c[pyIdx.indexOf(k)]; return { ok: v === true, why: nbWhy(v) }; }
        if (x.test.app) { const st = S.st && S.st.id === id ? S.st.ctl : null; return { ok: !!(st && st.ran && st.err === false), why: !st || !st.ran ? "Launch the app once (▶ Launch app) so the check can see it run." : st.err ? "The app shows an error. Fix it, then Apply." : "The app is still starting. Wait for it, then check again." }; }
        if (x.test.figs) return { ok: figs >= x.test.figs, why: figs + " figure" + (figs === 1 ? "" : "s") + " in this session" };
        if (x.test.md) { const cell = nb.cells.find(y => y.tag === x.test.md); const n = cell ? nbWords(cell.src) : 0; return { ok: n >= x.test.words, why: n + " words" }; }
        return { ok: false, why: "" };
      });
      const all = results.every(x => x.ok);
      g.nb[id] = Object.assign(g.nb[id] || {}, { passed: all || !!(g.nb[id] && g.nb[id].passed), last: TODAY(), score: results.filter(x => x.ok).length + "/" + results.length });
      let filled = 0;
      if (task) { g.crit[task.id] = g.crit[task.id] || {}; Object.entries(T.fill || {}).forEach(([k, f]) => { let v = null; if (typeof f === "string") { v = res.v[k]; if (typeof v === "number" && !isFinite(v)) v = null; } else if (f && f.md) { const cell = nb.cells.find(y => y.tag === f.md); v = cell ? nbAnswer(cell.src) : null; if (v === "") v = null; } if (v != null) { g.crit[task.id][k] = typeof v === "number" ? String(+v.toFixed(6)) : v; filled++; } }); }
      logEvent("nbcheck", { c: c.id, nb: id, all }); saveG();
      paintChecks({ results, all, filled });
    } finally { btn.disabled = false; }
  };
  const up = h("input", { type: "file", accept: ".csv,.tsv,.txt,.json,.xlsx,.parquet", hidden: true, onchange: async e => {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast("That file is over 20 MB. Use a sample of it.", "bad"); return; }
    const name = f.name.replace(/[^A-Za-z0-9._-]/g, "_"); const buf = await f.arrayBuffer();
    toast("Loading " + name + "…"); await RT().put(lang, name, buf);
    let url = null; if (S.assets) { try { const a = await S.assets.upload(new Blob([buf], { type: "text/csv" })); url = a.url; } catch (err) {} }
    nb.files = nb.files.filter(x => x.name !== name); nb.files.push({ name, url });
    toast(url ? name + " is stored with this notebook on your account. Read it with pd.read_csv(\"" + name + "\")." : name + " is loaded for this session only; upload it again next time.", url ? "ok" : "");
    nbSave(c, id); rc(filesEl, filesRow());
  } });
  const filesRow = () => [h("span", { class: "muted" }, "Data files: "), T.datasets.length ? T.datasets.map(f => pill(f)) : h("span", { class: "muted" }, "none needed"), nb.files.length ? [" · uploaded: ", nb.files.map(f => pill(f.name, "acc"))] : null, " ", h("label", { class: "btn ghost small" }, "Upload a data file", up)];
  const filesEl = h("div", { class: "nbfiles small row" }, filesRow());
  paintCells(); paintChecks(null);
  return [
    h("p", { class: "crumbs" }, h("a", { href: route(c, "t/projects") }, "← " + L.projects), task ? " · " + L.unit + " " + task.week : ""),
    h("div", { class: "row between" }, h("h1", null, T.title), h("div", { class: "row small muted" }, status, h("span", null, S.mode === "db" ? "Saved to your account" : "Saved in this browser"))),
    can ? null : h("p", { class: "note" }, "This course has no " + lang + " runtime here. You can still read, edit and export the notebook."),
    h("div", { class: "nbbar", role: "toolbar", "aria-label": "Notebook" },
      h("button", { class: "btn small primary", disabled: !can || null, onclick: async e => { e.currentTarget.disabled = true; await runAll(); e.currentTarget.disabled = false; } }, "▶ Run all"),
      h("button", { class: "btn small", disabled: !can || null, onclick: e => check(e.currentTarget) }, "✓ Check my work"),
      h("button", { class: "btn small", disabled: !can || null, onclick: async () => { await RT().reset(lang, ns); NB.exec = {}; paintCells(); toast("Python restarted. Variables are cleared; run the cells again."); } }, "Restart Python"),
      h("button", { class: "btn small", onclick: () => nbExport(c, id, nb) }, "Export (.ipynb + data, .zip)"),
      h("button", { class: "btn small ghost", onclick: e => { const b = e.currentTarget; if (b.dataset.armed !== "1") { b.dataset.armed = "1"; b.textContent = "Click again to replace your cells with the template"; setTimeout(() => { b.dataset.armed = ""; b.textContent = "Start over from the template"; }, 5000); return; } const files = nb.files; S.nbw[id] = nbFromTemplate(T); S.nbw[id].files = files; nbSave(c, id); RT().reset(lang, ns); S.view = null; render(); } }, "Start over from the template")),
    filesEl, checks, cellsEl,
    h("div", { class: "row" }, h("button", { class: "btn small", onclick: () => { nb.cells.push({ id: nbRand(), t: "code", src: "", tag: null, out: null }); nbSave(c, id); paintCells(); } }, "+ Code cell"), h("button", { class: "btn small", onclick: () => { nb.cells.push({ id: nbRand(), t: "md", src: "", tag: null, out: null, _edit: true }); nbSave(c, id); paintCells(); } }, "+ Text cell")),
  ];
}
function nbWhy(v) {
  if (v === true || v === false || v == null) return ""; v = String(v).replace(/^ERR:/, "");
  let m = v.match(/^NameError: name '([^']+)' is not defined/); if (m) return m[1] + " does not exist yet. Create it (and run that cell).";
  if (/NoneType/.test(v)) return "A variable is still None: replace the placeholder with your result.";
  m = v.match(/^KeyError: (.*)/); if (m) return "Missing column or key " + m[1] + ".";
  return "Python said: " + v;
}
function nbOut(x) {
  const o = x.out; if (!o) return null; const stale = !NB.exec[x.id];
  return h("div", null, o.text || o.value || o.err ? h("pre", { class: "out" + (stale ? " stale" : "") }, o.text || "", o.value != null ? h("span", { class: "muted" }, o.value) : null, o.err ? h("span", { class: "err" }, (o.text ? "\n" : "") + o.err) : null) : null,
    figures(NB.imgs[x.id]), stale && (o.text || o.value || o.err) ? h("small", { class: "muted" }, "Output from an earlier session. Run the notebook again to bring variables and charts back.") : null);
}
function nbCell(c, id, nb, x, i, repaint, runCell) {
  const el = h("div", { class: "nbcell " + (x.t === "code" ? "code" : "md") + (x.tag === "app" ? " app" : x.tag ? " answer" : "") });
  const mv = d => { const j = i + d; if (j < 0 || j >= nb.cells.length) return; [nb.cells[i], nb.cells[j]] = [nb.cells[j], nb.cells[i]]; nbSave(c, id); repaint(); };
  const del = h("button", { class: "icon", title: "Delete cell", "aria-label": "Delete cell", onclick: () => { if (del.dataset.armed !== "1") { del.dataset.armed = "1"; del.textContent = "Delete?"; setTimeout(() => { del.dataset.armed = ""; del.textContent = "✕"; }, 3000); return; } nb.cells.splice(i, 1); nbSave(c, id); repaint(); } }, "✕");
  const tools = h("span", { class: "nbtools" }, h("button", { class: "icon", "aria-label": "Move up", onclick: () => mv(-1) }, "↑"), h("button", { class: "icon", "aria-label": "Move down", onclick: () => mv(1) }, "↓"),
    h("button", { class: "link small", onclick: () => { nb.cells.splice(i + 1, 0, { id: nbRand(), t: "code", src: "", tag: null, out: null }); nbSave(c, id); repaint(); } }, "+ code"),
    h("button", { class: "link small", onclick: () => { nb.cells.splice(i + 1, 0, { id: nbRand(), t: "md", src: "", tag: null, out: null, _edit: true }); nbSave(c, id); repaint(); } }, "+ text"), x.tag ? null : del);
  if (x.t === "code") {
    const ta = codeArea(x.src, "python"); ta.addEventListener("input", () => { x.src = ta.value; nbSave(c, id); });
    const isApp = x.tag === "app";
    ta.addEventListener("keydown", e => { if (e.key === "Enter" && (e.shiftKey || e.ctrlKey || e.metaKey)) { e.preventDefault(); if (isApp) return stLaunch(c, id, nb, x); runCell(x, el).then(() => { if (e.shiftKey) { const nx = el.nextElementSibling; const t = nx && nx.querySelector("textarea"); if (t) t.focus(); } }); } });
    ap(el, h("div", { class: "nbhead" }, isApp ? [pill("app.py", "acc"), h("button", { class: "btn small primary", onclick: () => stLaunch(c, id, nb, x) }, "▶ Launch app")] : [h("span", { class: "nbn" }, NB.exec[x.id] ? "[" + NB.exec[x.id] + "]" : "[ ]"), h("button", { class: "btn small primary", onclick: () => runCell(x, el) }, "▶ Run")], tools), ta, h("div", { class: "nbout" }, nbOut(x)));
  } else {
    const editing = !!x._edit;
    const head = h("div", { class: "nbhead" }, x.tag ? [pill("Your answer", "acc"), h("small", { class: "muted wc" }, nbWords(x.src) + " words")] : h("span", { class: "nbn" }), h("button", { class: "btn small", onclick: () => { x._edit = !editing; repaint(); } }, editing ? "Done" : "Edit"), tools);
    if (editing) { const ta = h("textarea", { class: "prosebox", "aria-label": "Text cell" }); ta.value = x.src; ta.addEventListener("input", () => { x.src = ta.value; fitArea(ta); nbSave(c, id); const wc = head.querySelector(".wc"); if (wc) wc.textContent = nbWords(x.src) + " words"; }); ta.addEventListener("keydown", e => { if (e.key === "Enter" && (e.shiftKey || e.ctrlKey || e.metaKey)) { e.preventDefault(); x._edit = false; repaint(); } }); setTimeout(() => fitArea(ta), 0); ap(el, head, ta); }
    else { const m = mdEl(x.src || "_Empty text cell. Press Edit._", "nbmd"); m.addEventListener("dblclick", () => { x._edit = true; repaint(); }); ap(el, head, m); }
  }
  return el;
}
/* Streamlit: cells tagged "app" run as a real Streamlit app in an overlay. */
function stLaunch(c, id, nb, x) {
  if (!RT().apps()) { toast("This course does not run Streamlit apps.", "bad"); return; }
  let ov = $("#stov");
  if (!ov) { ov = h("div", { id: "stov", class: "stov", role: "dialog", "aria-label": "Streamlit app" }); document.body.appendChild(ov); }
  const stat = h("span", { class: "small muted", role: "status" }); const host = h("div", { class: "stbody" });
  const close = () => { ov.hidden = true; document.documentElement.style.overflow = ""; };
  rc(ov, h("div", { class: "stbar" }, h("button", { class: "btn small", onclick: close }, "← Back to the code"), h("b", null, "Your Streamlit app"), stat, h("span", { class: "grow" }),
    h("button", { class: "btn small primary", onclick: () => S.st && S.st.ctl.apply(x.src) }, "Apply my code"), h("button", { class: "btn small ghost", onclick: () => S.st && S.st.ctl.restart(x.src) }, "Restart the app")), host);
  ov.hidden = false; document.documentElement.style.overflow = "hidden";
  ov.onkeydown = e => { if (e.key === "Escape") close(); };
  if (S.st && S.st.id === id && S.st.host) { host.replaceWith(S.st.host); S.st.stat = stat; S.st.ctl.apply(x.src); return; }
  if (S.st) { try { S.st.ctl.stop(); } catch (e) {} }
  const st = { id, host, stat }; S.st = st;
  st.ctl = CKRun.streamlit(host, x.src, nbFiles(c, nb), (state, text) => { if (st.stat) st.stat.textContent = text; });
}
/* .ipynb export inside a .zip, with the data files the notebook uses. */
async function nbExport(c, id, nb) {
  const T = nbOf(id); const files = nbFiles(c, nb);
  const used = files.filter(f => nb.cells.some(x => x.t === "code" && x.src.includes(f.name)));
  const lines = s => { const a = String(s).split("\n"); return a.map((l, i) => i < a.length - 1 ? l + "\n" : l); };
  const cells = [{ cell_type: "markdown", id: "ck-header", metadata: {}, source: lines("_Exported from " + c.title + " on " + TODAY() + "." + (used.length ? " Data files used: " + used.map(f => f.name).join(", ") + ". They are in this zip; in Colab, upload them with the Files panel before running." : "") + "_") }];
  for (const x of nb.cells) {
    if (x.t === "md") { cells.push({ cell_type: "markdown", id: x.id, metadata: {}, source: lines(x.src) }); continue; }
    if (x.tag === "app") { cells.push({ cell_type: "code", id: x.id, execution_count: null, metadata: {}, outputs: [], source: lines("%%writefile app.py\n" + x.src) }); cells.push({ cell_type: "markdown", id: x.id + "r", metadata: {}, source: lines("Run the app on your computer with `streamlit run app.py`.") }); continue; }
    const outs = []; const o = x.out; const n = NB.exec[x.id] || null;
    if (o && o.text) outs.push({ output_type: "stream", name: "stdout", text: lines(o.text) });
    for (const p of NB.imgs[x.id] || []) outs.push({ output_type: "display_data", data: { "image/png": p, "text/plain": ["<Figure>"] }, metadata: {} });
    if (o && o.value != null) outs.push({ output_type: "execute_result", execution_count: n, data: { "text/plain": lines(o.value) }, metadata: {} });
    if (o && o.err) outs.push({ output_type: "stream", name: "stderr", text: lines(o.err) });
    cells.push({ cell_type: "code", id: x.id, execution_count: n, metadata: {}, outputs: outs, source: lines(x.src) });
  }
  const json = JSON.stringify({ cells, metadata: { kernelspec: { display_name: "Python 3", language: "python", name: "python3" }, language_info: { name: "python" } }, nbformat: 4, nbformat_minor: 5 }, null, 1);
  const name = id.replace(/[^a-z0-9-]/gi, "") + "-" + c.id;
  const enc = new TextEncoder(); const zf = [{ name: name + ".ipynb", data: enc.encode(json) }];
  const app = nb.cells.find(x => x.tag === "app"); if (app) zf.push({ name: "app.py", data: enc.encode(app.src) });
  for (const f of used) { try { const r = await fetch(new URL(f.url, document.baseURI).href); if (r.ok) zf.push({ name: f.name, data: new Uint8Array(await r.arrayBuffer()) }); } catch (e) {} }
  const zip = zipStore(zf); const blob = new Blob([zip], { type: "application/zip" });
  if (S.downloads) { try { await S.downloads.save({ filename: name + ".zip", data: blob }); toast("Saved " + name + ".zip", "ok"); return; } catch (e) { if (e && e.code === "cancelled") return; } }
  const a = h("a", { href: URL.createObjectURL(blob), download: name + ".zip" }); document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1000);
}
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let x = n; for (let k = 0; k < 8; k++) x = x & 1 ? 0xEDB88320 ^ (x >>> 1) : x >>> 1; t[n] = x >>> 0; } return t; })();
function crc32(b) { let x = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) x = CRC_T[(x ^ b[i]) & 255] ^ (x >>> 8); return (x ^ 0xFFFFFFFF) >>> 0; }
function zipStore(files) {
  const enc = new TextEncoder(); const parts = [], central = []; let off = 0;
  const d = new Date(); const dt = ((d.getFullYear() - 1980) << 25) | ((d.getMonth() + 1) << 21) | (d.getDate() << 16) | (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  for (const f of files) {
    const nm = enc.encode(f.name); const crc = crc32(f.data); const sz = f.data.length;
    const lh = new DataView(new ArrayBuffer(30)); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint32(10, dt, true); lh.setUint32(14, crc, true); lh.setUint32(18, sz, true); lh.setUint32(22, sz, true); lh.setUint16(26, nm.length, true);
    parts.push(new Uint8Array(lh.buffer), nm, f.data);
    const ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint32(12, dt, true); ch.setUint32(16, crc, true); ch.setUint32(20, sz, true); ch.setUint32(24, sz, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
    central.push(new Uint8Array(ch.buffer), nm); off += 30 + nm.length + sz;
  }
  const csz = central.reduce((n, p) => n + p.length, 0); const end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csz, true); end.setUint32(16, off, true);
  const all = parts.concat(central, [new Uint8Array(end.buffer)]); const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0)); let p = 0; for (const a of all) { out.set(a, p); p += a.length; } return out;
}
