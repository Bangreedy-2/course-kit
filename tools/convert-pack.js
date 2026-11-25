#!/usr/bin/env node
/* Converts a format-1 course pack (packs/<id>/) into a Coursekit course file
   (courses/<id>.coursekit.json) that the player imports. Nothing is dropped:
   every lesson, practice item (with its checks), recall card, drill, task,
   done-when criterion, weekly quiz, checkpoint, notebook and data file of the
   pack has its place in the course file. tools/parity.js proves it item by item.
   Usage: node tools/convert-pack.js <pack-id> [design.json]
   Block ids are derived from the lesson id and position, so converting again
   gives the same ids (learners' progress is keyed by them). */
const fs = require("fs"), path = require("path");
const { parseLessons } = require("../app/js/text.js");
const CK = require("../player/src/core.js");

function bid(lessonId, n) {
  let x = 2166136261; for (const c of lessonId + "#" + n) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); }
  return "b" + (x >>> 0).toString(36).padStart(7, "0") + n.toString(36).padStart(2, "0");
}
/* Lesson prose becomes md blocks, split at "## " headings. */
function proseBlocks(body) {
  const out = []; let cur = [];
  const flush = () => { const t = cur.join("\n").trim(); if (t) out.push({ t: "md", md: t }); cur = []; };
  for (const ln of body.split("\n")) { if (/^## /.test(ln)) flush(); cur.push(ln); }
  flush();
  return out;
}
function firstCode(prompt) { const m = String(prompt).match(/```(\w*)\n([\s\S]*?)\n```/); if (!m || (m[1] && !/^(py|python)$/i.test(m[1]))) return null; return m[2]; }
function practiceBlock(p, L, k, pack) {
  const why = p.why || undefined;
  switch (p.type) {
    case "choice": {
      const ok = p.opts.map((o, i) => o.ok ? i : -1).filter(i => i >= 0);
      return { t: "choice", q: p.prompt, options: p.opts.map(o => o.t), answer: ok.length === 1 ? ok[0] : ok, why };
    }
    case "answer": return { t: "answer", q: p.prompt, accept: [p.expect.join(" "), ...p.alts].filter(Boolean), why };
    case "predict": return { t: "predict", q: p.prompt, expect: p.expect, alts: p.alts.length ? p.alts : undefined, why };
    case "write": return { t: "write", q: p.prompt, min: p.min || 30, model: p.solution || why || "A good answer explains the idea in your own words with one concrete example.", rubric: why };
    case "run": return { t: "run", lang: "python", q: p.prompt, starter: p.starter || undefined, test: p.test || "", expect: p.expect, solution: p.solution || "", why };
    case "local": {
      // pack.localRun lists the tracks whose "local" items can run on the page; left out, all can.
      const canRun = hasPython(pack) && (!pack.localRun || pack.localRun.includes(L.track));
      const code = (pack.localCode || {})[L.id + "#" + k] || (canRun ? firstCode(p.prompt) : null);
      return { t: "output", lang: "python", q: p.prompt, code: code || undefined, expect: p.expect, min: p.expect.length ? p.min || 1 : Math.max(2, p.min || 1), why };
    }
  }
  throw new Error("unknown practice type " + p.type + " in " + L.title);
}
const hasPython = pack => (pack.runtimes || []).includes("python");
const CRIT = { L: "lesson", D: "drill", QZ: "quiz", X: "checkpoint", DAYS: "days", U: "link", T: "text", N: "number", C: "check" };

function convert(id, designFile) {
  const dir = path.join(__dirname, "..", "packs", id);
  const pack = JSON.parse(fs.readFileSync(path.join(dir, "course.json"), "utf8"));
  designFile = designFile || path.join(__dirname, "designs", id + ".json");
  const extra = fs.existsSync(designFile) ? JSON.parse(fs.readFileSync(designFile, "utf8")) : {};
  const parsed = [];
  for (const f of pack.lessons) parsed.push(...parseLessons(fs.readFileSync(path.join(dir, f), "utf8")));
  // A checkpoint may keep its own questions in a "bank" lesson, which is not a lesson of the course.
  const bankIds = new Set((pack.exams || []).map(x => x.bank).filter(Boolean));
  const lessons = parsed.filter(l => !bankIds.has(l.id)), banks = Object.fromEntries(parsed.filter(l => bankIds.has(l.id)).map(l => [l.id, l]));
  const drills = pack.drills ? JSON.parse(fs.readFileSync(path.join(dir, pack.drills), "utf8")) : [];
  const notebooks = pack.notebooks && hasPython(pack) ? JSON.parse(fs.readFileSync(path.join(dir, pack.notebooks), "utf8")) : {};

  const weeks = pack.weeks || [];
  const unitWord = (pack.labels && pack.labels.unit) || ((pack.schedule && pack.schedule.unit) || "week").replace(/^./, c => c.toUpperCase());
  const units = weeks.map(w => ({ id: "w" + w.n, title: w.title, goal: w.goal || "" }));
  const practiceIds = {}; // "lesson#k" -> block id
  const outLessons = [];
  for (const L of lessons) {
    const blocks = proseBlocks(L.body);
    const first = blocks.length;
    L.practice.forEach((p, k) => { blocks.push(practiceBlock(p, L, k, pack)); });
    if (L.recall.length) blocks.push({ t: "cards", cards: L.recall.map(r => ({ q: r.q, a: r.a })) });
    blocks.forEach((b, i) => { b.id = bid(L.id, i); for (const key of Object.keys(b)) if (b[key] === undefined) delete b[key]; });
    L.practice.forEach((p, k) => { practiceIds[L.id + "#" + k] = blocks[first + k].id; });
    for (const ins of (extra.inserts || []).filter(x => x.lesson === L.id)) {
      const at = ins.afterHeading ? blocks.findIndex(b => b.t === "md" && b.md.startsWith("## " + ins.afterHeading)) + 1 : (ins.at ?? blocks.length);
      const block = Object.assign({ id: bid(L.id + "+" + ins.key, 0) }, ins.block);
      if (block.htmlFile) { block.html = fs.readFileSync(path.join(path.dirname(designFile), block.htmlFile), "utf8"); delete block.htmlFile; }
      blocks.splice(at > 0 ? at : blocks.length, 0, block);
    }
    const minutes = Number((/(\d+)\s*min/.exec(L.sub) || [])[1]) || undefined;
    const lesson = { id: L.id, unit: "w" + L.week, week: L.week, track: L.track || undefined, sub: L.sub || undefined, title: L.title, summary: L.sub.replace(/^About \d+ min reading\s*·?\s*/, "").slice(0, 300), minutes, blocks };
    for (const key of Object.keys(lesson)) if (lesson[key] === undefined) delete lesson[key];
    outLessons.push(lesson);
  }
  const plan = weeks.length ? {
    phases: (pack.phases || []).map(ph => ({ id: ph.id, title: ph.title, goal: ph.goal, weeks: ph.weeks })),
    projects: pack.projects && pack.projects.length ? pack.projects : undefined,
    weeks: weeks.map(w => {
      const o = { title: w.title, goal: w.goal, tasks: w.tasks.map(t => {
        const task = { id: t.id, title: t.title, desc: t.desc, track: t.track, core: !!t.core, h: t.h, lessons: t.lessons, res: t.res, due: t.due, page: t.page, group: t.group,
          project: t.project != null ? String(t.project) : t.hw != null ? String(t.hw) : undefined, notebook: notebooks[t.id] ? t.id : undefined,
          crit: t.crit.map(c => { const o = Object.assign({}, c, { t: CRIT[c.t] || c.t }); if (o.t === "link" && !o.hosts) o.hosts = pack.linkHosts || []; return o; }) };
        for (const key of Object.keys(task)) if (task[key] === undefined) delete task[key];
        return task;
      }) };
      if (w.light) o.light = true;
      if (w.quiz && w.quiz.length) { o.quiz = w.quiz.map(q => ({ q: q.q, o: q.o, a: q.a, why: q.why })); o.quizMax = w.quizMax != null ? w.quizMax : 1; }
      return o;
    }),
  } : undefined;
  const checkpoints = (pack.exams || []).map(x => x.bank ? (() => {
    const B = banks[x.bank]; if (!B) throw new Error("checkpoint " + x.id + ": no bank lesson " + x.bank);
    const blocks = B.practice.map((p, k) => Object.assign(practiceBlock(p, B, k, pack), { id: bid(B.id, k) }));
    for (const b of blocks) for (const key of Object.keys(b)) if (b[key] === undefined) delete b[key];
    return { id: x.id, title: x.title, week: x.week, minutes: x.minutes, pass: x.pass, lessons: x.lessons, intro: B.body.trim(), blocks, items: blocks.map(b => "own:" + b.id) };
  })() : ({ id: x.id, title: x.title, week: x.week, minutes: x.minutes, pass: x.pass, lessons: x.lessons,
    items: x.items.map(ref => { if (ref.startsWith("D:")) return "drill:" + ref.slice(2); const b = practiceIds[ref]; if (!b) throw new Error("checkpoint " + x.id + ": no practice item " + ref); const [lid] = ref.split("#"); return lid + ":" + b; }) }));
  const outDrills = drills.map(d => { const o = Object.assign({}, d); if (d.tests) o.lang = "python"; if (!d.tests) { delete o.tests; delete o.expect; } if (o.starter == null) delete o.starter; if (o.format == null) delete o.format; return o; });
  const nbs = {};
  for (const [k, n] of Object.entries(notebooks)) nbs[k] = Object.assign({ lang: "python" }, n);
  const anyApp = Object.values(nbs).some(n => n.cells.some(c => c.tag === "app"));
  const labels = Object.assign({ unit: unitWord }, pack.labels || {});
  const course = {
    id: pack.id, title: pack.title, subtitle: pack.subtitle || "", description: pack.description || "", language: pack.language || "en",
    tutor: Object.assign({ name: pack.assistantName || "Tutor", persona: "" }, extra.tutor || {}),
    design: extra.design || {}, units, widgets: extra.widgets || {},
    labels, tracks: pack.tracks || {},
  };
  if (hasPython(pack)) course.runtimes = { python: Object.assign({ engine: "pyodide" }, anyApp ? { apps: true } : {}, pack.python && pack.python.packages ? { packages: pack.python.packages } : {}) };
  if (pack.data && pack.data.length) course.files = pack.data.map(n => ({ name: n, url: "data/" + id + "/" + n }));
  if (weeks.length) course.schedule = Object.assign({ unitDays: 7 }, pack.schedule && pack.schedule.fixed ? { start: pack.schedule.start } : {});
  const file = { coursekit: CK.FORMAT, course, lessons: outLessons };
  if (plan) file.plan = plan;
  if (outDrills.length) file.drills = outDrills;
  if (checkpoints.length) file.checkpoints = checkpoints;
  if (pack.pages && pack.pages.length) file.pages = pack.pages;
  if (Object.keys(nbs).length) file.notebooks = nbs;
  for (const x of extra.lessons || []) { const i = file.lessons.findIndex(l => l.id === x.after); x.blocks.forEach((b, k) => b.id = b.id || bid(x.id, k)); const l = Object.assign({}, x); delete l.after; file.lessons.splice(i >= 0 ? i + 1 : file.lessons.length, 0, l); }
  return { file, pack, lessons, drills, notebooks };
}

if (require.main === module) {
  const id = process.argv[2];
  if (!id) { console.error("usage: node tools/convert-pack.js <pack-id> [design.json]"); process.exit(1); }
  const { file } = convert(id, process.argv[3]);
  const imp = CK.importCourse(file, { keepIds: true }); // throws if anything breaks a rule
  if (imp.errors.length) { console.error(imp.errors.join("\n")); process.exit(1); }
  const outDir = path.join(__dirname, "..", "courses"); fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, id + ".coursekit.json");
  fs.writeFileSync(out, JSON.stringify(file, null, 1) + "\n");
  console.log("wrote " + path.relative(process.cwd(), out) + ": " + imp.lessons.length + " lessons, " + imp.meta.units.length + " units, " +
    (imp.mods.drills || []).length + " drills, " + (imp.mods.checkpoints || []).length + " checkpoints, " + Object.keys(imp.mods.notebooks || {}).length + " notebooks, " +
    (fs.statSync(out).size / 1024).toFixed(0) + " KB" + (imp.meta.designNotes.length ? "\ndesign notes: " + imp.meta.designNotes.join("; ") : ""));
}
module.exports = { convert, bid };
