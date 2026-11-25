#!/usr/bin/env node
/* Converts a format-1 course pack (packs/<id>/) into a Coursekit course file
   (courses/<id>.coursekit.json) that the player imports.
   Usage: node tools/convert-pack.js <pack-id> [design.json]
   Block ids are derived from the lesson id and position, so converting again
   gives the same ids. */
const fs = require("fs"), path = require("path");
const { parseLessons } = require("../app/js/text.js");
const CK = require("../player/src/core.js");

const id = process.argv[2];
if (!id) { console.error("usage: node tools/convert-pack.js <pack-id> [design.json]"); process.exit(1); }
const dir = path.join(__dirname, "..", "packs", id);
const course = JSON.parse(fs.readFileSync(path.join(dir, "course.json"), "utf8"));
const designFile = process.argv[3] || path.join(__dirname, "designs", id + ".json");
const extra = fs.existsSync(designFile) ? JSON.parse(fs.readFileSync(designFile, "utf8")) : {};

const lessons = [];
for (const f of course.lessons) lessons.push(...parseLessons(fs.readFileSync(path.join(dir, f), "utf8")));
const drills = course.drills ? JSON.parse(fs.readFileSync(path.join(dir, course.drills), "utf8")) : [];

function bid(lessonId, n) {
  let x = 2166136261; for (const c of lessonId + "#" + n) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); }
  return "b" + (x >>> 0).toString(36).padStart(7, "0") + n.toString(36).padStart(2, "0");
}
/* Split lesson prose into md blocks at "## " headings; "> " paragraphs that open with a bold label become callouts. */
function proseBlocks(body) {
  const out = []; let cur = [];
  const flush = () => { const t = cur.join("\n").trim(); if (t) out.push({ t: "md", md: t }); cur = []; };
  for (const ln of body.split("\n")) { if (/^## /.test(ln)) flush(); cur.push(ln); }
  flush();
  return out;
}
const fence = (lang, code) => "```" + (lang || "") + "\n" + code + "\n```";
function practiceBlock(p, lessonTitle) {
  const why = p.why || undefined;
  switch (p.type) {
    case "choice": {
      const ok = p.opts.map((o, i) => o.ok ? i : -1).filter(i => i >= 0);
      return { t: "choice", q: p.prompt, options: p.opts.map(o => o.t), answer: ok.length === 1 ? ok[0] : ok, why };
    }
    case "answer": return { t: "answer", q: p.prompt, accept: [...p.expect, ...p.alts], why };
    case "predict":
      if (p.expect.length === 1) return { t: "answer", q: p.prompt + "\n\nType the exact output.", accept: [...p.expect, ...p.alts], why };
      return { t: "task", q: p.prompt + "\n\nWrite down the exact output, then compare.", solution: fence("text", p.expect.join("\n")) + (why ? "\n\n" + why : "") };
    case "write": return { t: "write", q: p.prompt, min: p.min || 30, model: p.solution || why || "A good answer explains the idea in your own words with one concrete example.", rubric: why };
    case "run": case "local": {
      const sol = p.solution ? p.solution : "";
      const expect = p.expect.length ? "Expected output:\n" + fence("text", p.expect.join("\n")) : "";
      return { t: "task", lang: "python", q: p.prompt + (p.test ? "\n\nCheck your code with:\n" + fence("python", p.test) : "") + (p.type === "local" ? "\n\nRun it on your computer." : ""),
        starter: p.starter || undefined, solution: sol ? fence("python", sol) + (expect ? "\n\n" + expect : "") : expect || "Your code runs and prints the expected values." };
    }
  }
  throw new Error("unknown practice type " + p.type + " in " + lessonTitle);
}

const weeks = course.weeks || [];
const units = weeks.map(w => ({ id: "w" + w.n, title: w.title, goal: w.goal || "" }));
const outLessons = [], problems = [];
for (const L of lessons) {
  const blocks = proseBlocks(L.body);
  for (const p of L.practice) blocks.push(practiceBlock(p, L.title));
  const myDrills = drills.filter(d => d.lesson === L.id);
  if (L.recall.length) blocks.push({ t: "cards", cards: L.recall.map(r => ({ q: r.q, a: r.a })) });
  if (myDrills.length) blocks.push({ t: "cards", cards: myDrills.map(d => ({ q: "From memory: " + d.title + ". " + d.prompt, a: d.format === "text" ? d.solution : fence("python", d.solution) })) });
  // The week's self-check quiz goes into the week's last lesson.
  const week = weeks.find(w => w.n === L.week);
  const lastOfWeek = lessons.filter(x => x.week === L.week).slice(-1)[0] === L;
  if (week && lastOfWeek) for (const q of week.quiz || []) blocks.push({ t: "choice", q: "Week check: " + q.q, options: q.o, answer: q.a, why: q.why });
  blocks.forEach((b, i) => b.id = bid(L.id, i));
  for (const ins of (extra.inserts || []).filter(x => x.lesson === L.id)) {
    const at = ins.afterHeading ? blocks.findIndex(b => b.t === "md" && b.md.startsWith("## " + ins.afterHeading)) + 1 : (ins.at ?? blocks.length);
    const block = Object.assign({ id: bid(L.id + "+" + ins.key, 0) }, ins.block);
    if (block.htmlFile) { block.html = fs.readFileSync(path.join(path.dirname(designFile), block.htmlFile), "utf8"); delete block.htmlFile; }
    blocks.splice(at > 0 ? at : blocks.length, 0, block);
  }
  const minutes = Number((/(\d+)\s*min/.exec(L.sub) || [])[1]) || undefined;
  const lesson = { id: L.id, unit: "w" + L.week, title: L.title, summary: L.sub.replace(/^About \d+ min reading\s*·?\s*/, "").slice(0, 300), minutes, blocks };
  try { CK.normalizeLesson(lesson, { keepId: true }); } catch (e) { problems.push(L.id + ": " + e.message); }
  outLessons.push(lesson);
}
const file = {
  coursekit: CK.FORMAT,
  course: {
    id: course.id, title: course.title, subtitle: course.subtitle || "", description: course.description || "", language: course.language || "en",
    tutor: Object.assign({ name: course.assistantName || "Tutor", persona: "" }, extra.tutor || {}),
    design: extra.design || {}, units, widgets: extra.widgets || {},
  },
  lessons: outLessons,
};
// Extra lessons written for the v2 format (widgets and so on) go after the lesson they name.
for (const x of extra.lessons || []) { const i = file.lessons.findIndex(l => l.id === x.after); x.blocks.forEach((b, k) => b.id = b.id || bid(x.id, k)); const l = Object.assign({}, x); delete l.after; file.lessons.splice(i >= 0 ? i + 1 : file.lessons.length, 0, l); try { CK.normalizeLesson(l, { keepId: true }); } catch (e) { problems.push(l.id + ": " + e.message); } }
const imp = CK.importCourse(file, { keepIds: true }); // throws if anything breaks a rule
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
const outDir = path.join(__dirname, "..", "courses"); fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, id + ".coursekit.json");
fs.writeFileSync(out, JSON.stringify(file, null, 1) + "\n");
console.log("wrote " + path.relative(process.cwd(), out) + ": " + imp.lessons.length + " lessons, " + imp.meta.units.length + " units, " + (fs.statSync(out).size / 1024).toFixed(0) + " KB" + (imp.meta.designNotes.length ? "\ndesign notes: " + imp.meta.designNotes.join("; ") : ""));
