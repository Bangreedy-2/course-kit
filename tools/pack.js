#!/usr/bin/env node
/* Coursekit pack tool.
   node tools/pack.js validate [packs/<id> ...]   check packs for broken references (all packs if none given)
   node tools/pack.js index                       rebuild packs/index.json, the list of courses the app shows */
"use strict";
const fs = require("fs"), path = require("path");
const { parseLessons } = require("../app/js/text.js");
const ROOT = path.join(__dirname, "..", "packs");

function loadPack(dir) {
  const course = JSON.parse(fs.readFileSync(path.join(dir, "course.json"), "utf8"));
  const lessons = [];
  for (const f of course.lessons || []) parseLessons(fs.readFileSync(path.join(dir, f), "utf8")).forEach((l) => lessons.push(Object.assign(l, { file: f })));
  const drills = course.drills ? JSON.parse(fs.readFileSync(path.join(dir, course.drills), "utf8")) : [];
  const notebooks = course.notebooks ? JSON.parse(fs.readFileSync(path.join(dir, course.notebooks), "utf8")) : {};
  return { course, lessons, drills, notebooks };
}

function validate(dir) {
  const errs = [], warn = [];
  let P;
  try { P = loadPack(dir); } catch (e) { return { errs: ["cannot load: " + e.message], warn }; }
  const { course: c, lessons, drills, notebooks } = P;
  for (const k of ["id", "title", "lessons"]) if (!c[k]) errs.push("course.json: missing " + k);
  if (c.id && c.id !== path.basename(dir)) errs.push("course.json id '" + c.id + "' must match the folder name '" + path.basename(dir) + "'");
  const runtimes = c.runtimes || [];
  const LB = {}, DB = {};
  lessons.forEach((l) => { if (LB[l.id]) errs.push("duplicate lesson id " + l.id); LB[l.id] = l; });
  drills.forEach((d) => { if (DB[d.id]) errs.push("duplicate drill id " + d.id); DB[d.id] = d; });
  const tracks = c.tracks || {};
  lessons.forEach((l) => {
    const where = l.file + " (" + l.id + ")";
    if (!l.title) errs.push(where + ": no title");
    if (Object.keys(tracks).length && !tracks[l.track]) warn.push(where + ": track '" + l.track + "' is not in course.tracks");
    if (!l.practice.length) warn.push(where + ": no practice items, so it is marked learned as soon as it is opened");
    l.drills.forEach((d) => { if (!DB[d]) errs.push(where + ": drill " + d + " not found"); });
    l.practice.forEach((p, k) => {
      const w = where + " practice #" + k + " (@" + p.type + ")";
      if ((p.type === "run" || p.type === "local") && !runtimes.includes("python")) errs.push(w + ": needs the python runtime");
      if (p.type === "choice" && p.opts.filter((o) => o.ok).length !== 1) errs.push(w + ": needs exactly one option marked *");
      if ((p.type === "predict" || p.type === "answer") && !p.expect.length) errs.push(w + ": no expected answer (= line)");
      if (p.type === "run" && (!p.test || !p.expect.length)) errs.push(w + ": needs a test block and expected output");
      if (p.type === "write" && !p.min) warn.push(w + ": no min word count");
    });
    if (!l.recall.length) warn.push(where + ": no recall cards");
  });
  drills.forEach((d) => {
    if (!LB[d.lesson]) errs.push("drill " + d.id + ": lesson " + d.lesson + " not found");
    if (d.tests && !runtimes.includes("python")) errs.push("drill " + d.id + ": tests need the python runtime");
    if (!d.solution) errs.push("drill " + d.id + ": no solution");
  });
  const taskIds = {};
  (c.weeks || []).forEach((w, i) => {
    if (w.n !== i + 1) errs.push("weeks[" + i + "].n should be " + (i + 1));
    (w.tasks || []).forEach((t) => {
      if (taskIds[t.id]) errs.push("duplicate task id " + t.id); taskIds[t.id] = 1;
      (t.lessons || []).forEach((id) => { if (!LB[id]) errs.push("task " + t.id + ": lesson " + id + " not found"); });
      (t.crit || []).forEach((k, j) => {
        const w2 = "task " + t.id + " crit #" + j;
        if (!["L", "D", "QZ", "X", "DAYS", "U", "T", "N", "C"].includes(k.t)) errs.push(w2 + ": unknown type " + k.t);
        if (k.t === "L" && !LB[k.id]) errs.push(w2 + ": lesson " + k.id + " not found");
        if (k.t === "D" && !DB[k.id]) errs.push(w2 + ": drill " + k.id + " not found");
        if (k.t === "X" && !(c.exams || []).some((e) => e.id === k.id)) errs.push(w2 + ": checkpoint " + k.id + " not found");
      });
    });
    (w.quiz || []).forEach((q, j) => { if (!(q.a >= 0 && q.a < q.o.length)) errs.push("week " + w.n + " quiz #" + j + ": answer index out of range"); });
  });
  (c.phases || []).forEach((p) => p.weeks.forEach((n) => { if (!(c.weeks || [])[n - 1]) errs.push("phase " + p.id + ": week " + n + " not found"); }));
  (c.exams || []).forEach((e) => {
    e.lessons.forEach((id) => { if (!LB[id]) errs.push("checkpoint " + e.id + ": lesson " + id + " not found"); });
    e.items.forEach((ref) => {
      if (ref.startsWith("D:")) { if (!DB[ref.slice(2)]) errs.push("checkpoint " + e.id + ": drill " + ref + " not found"); return; }
      const [lid, k] = ref.split("#"); const l = LB[lid];
      if (!l || !l.practice[+k]) errs.push("checkpoint " + e.id + ": item " + ref + " not found");
      else if (l.practice[+k].type === "write") warn.push("checkpoint " + e.id + ": item " + ref + " is a write item; it is always marked correct once submitted");
    });
  });
  Object.keys(notebooks).forEach((id) => { if (!taskIds[id]) warn.push("notebook " + id + " has no task with the same id"); });
  (c.data || []).forEach((f) => { if (!fs.existsSync(path.join(dir, "data", f))) errs.push("data file " + f + " missing from data/"); });
  return { errs, warn, stats: { lessons: lessons.length, practice: lessons.reduce((n, l) => n + l.practice.length, 0), recall: lessons.reduce((n, l) => n + l.recall.length, 0), drills: drills.length, weeks: (c.weeks || []).length, checkpoints: (c.exams || []).length, notebooks: Object.keys(notebooks).length } };
}

function packDirs() { return fs.readdirSync(ROOT).map((d) => path.join(ROOT, d)).filter((d) => fs.existsSync(path.join(d, "course.json"))).sort(); }

const [cmd, ...args] = process.argv.slice(2);
if (cmd === "validate") {
  let bad = 0;
  for (const dir of args.length ? args : packDirs()) {
    const r = validate(path.resolve(dir));
    console.log((r.errs.length ? "FAIL " : "ok   ") + path.basename(dir) + (r.stats ? "  " + JSON.stringify(r.stats) : ""));
    r.errs.forEach((e) => console.log("  error: " + e));
    if (process.env.VERBOSE) r.warn.forEach((e) => console.log("  warning: " + e)); else if (r.warn.length) console.log("  " + r.warn.length + " warnings (VERBOSE=1 to list)");
    if (r.errs.length) bad++;
  }
  process.exit(bad ? 1 : 0);
} else if (cmd === "index") {
  const packs = packDirs().map((d) => { const c = JSON.parse(fs.readFileSync(path.join(d, "course.json"), "utf8")); return { id: c.id, title: c.title, subtitle: c.subtitle || "", description: c.description || "" }; });
  fs.writeFileSync(path.join(ROOT, "index.json"), JSON.stringify({ packs }, null, 1) + "\n");
  console.log("packs/index.json: " + packs.map((p) => p.id).join(", "));
} else {
  console.log("usage: node tools/pack.js validate [packs/<id> ...] | index");
  process.exit(2);
}
if (typeof module !== "undefined") module.exports = { validate, loadPack };
