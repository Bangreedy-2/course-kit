#!/usr/bin/env node
/* Proves a converted course keeps everything its format-1 pack had, item by item,
   and (with CK_PY set) that every checkable item still works in real Python, run
   through the player's own runtime code in a browser.
   Usage: [CK_PY=<dir with py/>] node tools/parity.js <pack-id>
   CK_PY points at a folder laid out like the published player (py/sp-worker.js,
   py/pyodide.mjs, the wheels…). Datasets come from packs/<id>/data. */
const fs = require("fs"), path = require("path");
const { convert } = require("./convert-pack.js");
const CK = require("../player/src/core.js");
const root = path.join(__dirname, "..");
const id = process.argv[2] || "music-theory";

let fails = 0, checks = 0;
const ok = (c, msg) => { checks++; if (!c) { fails++; console.log("FAIL " + msg); } };
const section = t => console.log("\n== " + t);

const { file, pack, lessons, drills, notebooks } = convert(id);
const saved = JSON.parse(fs.readFileSync(path.join(root, "courses", id + ".coursekit.json"), "utf8"));
ok(JSON.stringify(saved) === JSON.stringify(file), "courses/" + id + ".coursekit.json is up to date with the pack (run tools/convert-pack.js)");
const imp = CK.importCourse(file, { keepIds: true });
ok(!imp.errors.length, "course imports without errors: " + imp.errors.join("; "));

section("Lessons and practice");
const byId = Object.fromEntries(file.lessons.map(l => [l.id, l]));
let nItems = 0, nCards = 0;
for (const L of lessons) {
  const l = byId[L.id]; ok(l, "lesson " + L.id + " exists"); if (!l) continue;
  ok(l.title === L.title, L.id + ": title");
  ok(l.week === L.week && (l.track || "") === (L.track || ""), L.id + ": week and track");
  const prac = l.blocks.filter(b => CK.PRACTICE.includes(b.t) && b.t !== "cards");
  const want = { choice: "choice", answer: "answer", predict: "predict", run: "run", local: "output", write: "write" };
  ok(prac.length >= L.practice.length, L.id + ": " + L.practice.length + " practice items kept (" + prac.length + ")");
  L.practice.forEach((p, k) => {
    const b = prac[k]; nItems++;
    if (!b) return ok(false, L.id + "#" + k + " missing");
    ok(b.t === want[p.type], L.id + "#" + k + ": " + p.type + " became " + b.t);
    ok(b.q === p.prompt, L.id + "#" + k + ": prompt text");
    if (p.type === "choice") { ok(b.options.length === p.opts.length && b.options.every((o, i) => o === p.opts[i].t), L.id + "#" + k + ": options");
      const right = p.opts.map((o, i) => o.ok ? i : -1).filter(i => i >= 0); ok(JSON.stringify([].concat(b.answer)) === JSON.stringify(right), L.id + "#" + k + ": right options"); }
    if (p.type === "answer") ok(CK.checkAnswer(b, p.expect.join(" ")) && p.alts.every(a => CK.checkAnswer(b, a)), L.id + "#" + k + ": every accepted answer still accepted");
    if (p.type === "predict") ok(CK.checkAnswer(b, p.expect.join("\n")) && p.alts.every(a => CK.checkAnswer(b, a)), L.id + "#" + k + ": expected output accepted");
    if (p.type === "run") ok(b.test === (p.test || "") && JSON.stringify(b.expect) === JSON.stringify(p.expect) && b.solution === (p.solution || "") && (b.starter || "") === (p.starter || ""), L.id + "#" + k + ": test, expected output, solution and starter");
    if (p.type === "local") ok(JSON.stringify(b.expect) === JSON.stringify(p.expect), L.id + "#" + k + ": expected output");
    if ((p.why || "") && p.type !== "write") ok(b.why === p.why, L.id + "#" + k + ": explanation");
  });
  const cards = l.blocks.filter(b => b.t === "cards").flatMap(b => b.cards);
  ok(cards.length === L.recall.length && L.recall.every((r, i) => cards[i].q === r.q && cards[i].a === r.a), L.id + ": " + L.recall.length + " recall cards");
  nCards += L.recall.length;
}
console.log(lessons.length + " lessons, " + nItems + " practice items, " + nCards + " recall cards compared");

section("Plan, quizzes, checkpoints");
const weeks = pack.weeks || [];
ok(file.plan.weeks.length === weeks.length, weeks.length + " weeks");
let nTasks = 0, nCrit = 0, nQuiz = 0;
weeks.forEach((w, i) => {
  const pw = file.plan.weeks[i];
  ok(pw.title === w.title && (pw.goal || "") === (w.goal || ""), "week " + w.n + ": title and goal");
  ok(pw.tasks.length === w.tasks.length, "week " + w.n + ": " + w.tasks.length + " tasks");
  w.tasks.forEach((t, k) => { const pt = pw.tasks[k]; nTasks++;
    ok(pt && pt.id === t.id && pt.title === t.title && pt.h === t.h && !!pt.core === !!t.core && (pt.desc || "") === (t.desc || ""), "task " + t.id);
    ok(pt && pt.crit.length === t.crit.length, "task " + t.id + ": " + t.crit.length + " done-when criteria");
    nCrit += t.crit.length;
  });
  ok((pw.quiz || []).length === (w.quiz || []).length, "week " + w.n + ": quiz questions"); nQuiz += (w.quiz || []).length;
});
ok(file.plan.phases.length === (pack.phases || []).length, "phases");
ok(((file.plan.projects || []).length) === (pack.projects || []).length, (pack.projects || []).length + " named projects");
ok(((file.pages || []).length) === (pack.pages || []).length, (pack.pages || []).length + " pages");
for (const pg of pack.pages || []) { const n = weeks.flatMap(w => w.tasks).filter(t => t.page === pg.id).length; ok(file.plan.weeks.flatMap(w => w.tasks).filter(t => t.page === pg.id).length === n && n > 0, "page " + pg.id + ": " + n + " tasks"); }
const exams = pack.exams || [];
ok(file.checkpoints.length === exams.length, exams.length + " checkpoints");
const { parseLessons } = require("../app/js/text.js");
const allParsed = pack.lessons.flatMap(f => parseLessons(fs.readFileSync(path.join(root, "packs", id, f), "utf8")));
exams.filter(x => x.bank).forEach(x => { const c = file.checkpoints.find(k => k.id === x.id); const B = allParsed.find(l => l.id === x.bank);
  ok(c && B && c.blocks.length === B.practice.length && c.minutes === x.minutes && c.pass === x.pass, "checkpoint " + x.id + ": its own " + (B ? B.practice.length : "?") + " questions, time and pass mark");
  if (c && B) { B.practice.forEach((p, k) => ok(c.blocks[k].q === p.prompt, "checkpoint " + x.id + " question " + (k + 1) + ": text")); nItems += B.practice.length; ok(!byId[x.bank], "checkpoint " + x.id + ": its question bank is not listed as a lesson"); } });
exams.filter(x => !x.bank).forEach((x) => { const c = file.checkpoints.find(k => k.id === x.id); ok(c.items.length === x.items.length && c.minutes === x.minutes && c.pass === x.pass, "checkpoint " + x.id + ": " + x.items.length + " items, time and pass mark");
  for (const ref of c.items) { if (ref.startsWith("drill:")) ok(file.drills.some(d => d.id === ref.slice(6)), x.id + ": " + ref); else { const [lid, bid] = ref.split(":"); ok(byId[lid] && byId[lid].blocks.some(b => b.id === bid), x.id + ": " + ref); } } });
console.log(nTasks + " tasks, " + nCrit + " criteria, " + nQuiz + " quiz questions, " + exams.length + " checkpoints compared");

section("Drills and notebooks");
ok(file.drills.length === drills.length, drills.length + " drills");
drills.forEach((d, i) => { const o = file.drills[i]; ok(o.id === d.id && o.prompt === d.prompt && o.solution === d.solution && (o.tests || "") === (d.tests || "") && JSON.stringify(o.hints || []) === JSON.stringify(d.hints || []) && o.mins === d.mins && o.lesson === d.lesson, "drill " + d.id); });
const nbIds = Object.keys(notebooks);
ok(Object.keys(file.notebooks || {}).length === nbIds.length, nbIds.length + " notebooks");
for (const k of nbIds) { const a = notebooks[k], b = file.notebooks[k]; ok(b && b.cells.length === a.cells.length && b.checks.length === a.checks.length && JSON.stringify(b.cells) === JSON.stringify(a.cells), "notebook " + k + ": " + a.cells.length + " cells, " + a.checks.length + " checks"); }
ok((file.course.files || []).length === (pack.data || []).length, (pack.data || []).length + " data files");
for (const n of pack.data || []) ok(fs.existsSync(path.join(root, "packs", id, "data", n)), "data file " + n + " is in the pack");

const done = () => { console.log("\n" + (fails ? fails + " of " + checks + " checks FAILED" : "all " + checks + " checks pass")); process.exit(fails ? 1 : 0); };
if (!process.env.CK_PY) { console.log("\n(set CK_PY to also run every exercise in real Python)"); done(); }

/* ---------- run everything in real Python, through the player's runtime ---------- */
(async () => {
  section("Running in real Python (the player's own runtime, in Chromium)");
  const { chromium } = require("playwright");
  const html = "<!doctype html><html><head><meta charset=utf8></head><body><script>" + fs.readFileSync(path.join(root, "player/test/mock-claude.js"), "utf8") + "</script>" + fs.readFileSync(path.join(root, "player/dist/coursekit-player.html"), "utf8") + "</body></html>";
  const MIME = { wasm: "application/wasm", mjs: "text/javascript", js: "text/javascript", json: "application/json", csv: "text/csv" };
  const browser = await chromium.launch(); const page = await browser.newPage();
  page.on("pageerror", e => console.log("page error: " + e));
  await page.route("http://ck.test/", r => r.fulfill({ contentType: "text/html", body: html }));
  await page.route(/fonts\.googleapis|fonts\.gstatic|cdnjs/, r => r.abort());
  await page.route(/^http:\/\/ck\.test\/(py|data)\//, r => {
    const rel = decodeURIComponent(new URL(r.request().url()).pathname.slice(1));
    const f = rel.startsWith("data/") ? path.join(root, "packs", id, "data", rel.split("/").pop()) : path.join(process.env.CK_PY, rel);
    if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: "" });
    r.fulfill({ status: 200, contentType: MIME[f.split(".").pop()] || "application/octet-stream", body: fs.readFileSync(f) });
  });
  await page.goto("http://ck.test/");
  await page.waitForFunction(() => window.CKRun);
  const jobs = [];
  for (const l of file.lessons) for (const b of l.blocks) {
    if (b.t === "run" && b.lang === "python") jobs.push({ kind: "run", name: l.id + " " + b.id, code: b.solution, test: b.test, expect: b.expect });
    if (b.t === "output" && b.code) jobs.push({ kind: "output", name: l.id + " " + b.id, code: b.code, block: b });
  }
  for (const d of file.drills) if (d.tests) jobs.push({ kind: "run", name: "drill " + d.id, code: d.solution, test: d.tests, expect: d.expect });
  for (const [k, n] of Object.entries(file.notebooks || {})) jobs.push({ kind: "notebook", name: "notebook " + k, code: (n.prelude || "") + "\n" + n.cells.filter(c => c.t === "code" && c.tag !== "app").map(c => c.src).join("\n\n") });
  console.log(jobs.length + " things to run");
  const t0 = Date.now(); const nbErr = [];
  for (const j of jobs) {
    const r = await page.evaluate(async ([j, course]) => {
      const R = window.CKRun.forCourse(course);
      if (j.kind === "run") { const x = await R.check("python", j.code, j.test, j.expect, { limitMs: 120000 }); return { ok: x.pass, info: x.err || (x.pass ? "" : "printed: " + x.testOut.slice(0, 300)) }; }
      const x = await R.run("python", j.code, { ns: "p-" + Math.random(), limitMs: 180000 });
      if (j.kind === "output") return { ok: x.ok && window.CK.checkAnswer(j.block, x.out), info: x.error || "printed: " + x.out.slice(0, 300) };
      return { ok: x.ok, info: x.error ? x.error.split("\n").slice(-3).join(" | ") : "" };
    }, [j, file.course]);
    if (j.kind === "notebook") { if (!r.ok) nbErr.push(j.name + ": " + r.info); console.log((r.ok ? "ok   " : "note ") + j.name + (r.ok ? "" : " (template stops: " + r.info + ")")); continue; }
    ok(r.ok, j.name + " (" + j.kind + "): " + r.info);
    if (r.ok) console.log("ok   " + j.name);
  }
  console.log("ran in " + Math.round((Date.now() - t0) / 1000) + " s" + (nbErr.length ? "; " + nbErr.length + " notebook templates stop at a blank the learner fills in (expected)" : ""));
  await browser.close();
  done();
})().catch(e => { console.error(e); process.exit(1); });
