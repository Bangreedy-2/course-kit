#!/usr/bin/env node
/* Unit tests for the rules and the Markdown renderer. Run: node player/test/core.js */
const assert = require("assert");
const CK = require("../src/core.js"), { md } = require("../src/md.js");
let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok   " + name); };
const throwsRule = (fn, re) => assert.throws(fn, e => e.name === "RuleError" && (!re || re.test(e.message)));
const teach = { t: "md", md: "## Idea\n\n" + "This sentence explains a real idea with enough words. ".repeat(10) };

t("faint text colours are corrected", () => {
  const { design, notes } = CK.normalizeDesign({ palette: { bg: "#ffffff", surface: "#ffffff", ink: "#bbbbbb", muted: "#dddddd", accent: "#eeeeee" } });
  assert(CK.contrast(design.palette.ink, design.palette.surface) >= 7);
  assert(CK.contrast(design.palette.muted, design.palette.surface) >= 4.5);
  assert(CK.contrast(design.palette.accent, design.palette.surface) >= 3);
  assert(notes.length >= 3);
});
t("an unknown design value is reported and never rejects the rest", () => {
  const { design, notes } = CK.normalizeDesign({ fonts: { body: "Comic Neue", display: "<bad>" }, layout: "grid", shape: "round", palette: { accent: "blue" }, emblem: "toolong" });
  assert.equal(design.fonts.body, "Comic Neue"); assert.equal(design.layout, "sidebar"); assert.equal(design.shape, "round");
  assert(notes.some(n => /layout "grid" is not one of/.test(n)) && notes.some(n => /fonts.display/.test(n)) && notes.some(n => /palette.accent/.test(n)) && notes.some(n => /emblem/.test(n)));
  assert(CK.normalizeDesign({ fonts: { body: "Playfair Display" } }).notes.some(n => /display face/.test(n)));
});
t("custom css is kept, and cannot load from elsewhere", () => {
  const { design, notes } = CK.normalizeDesign({ css: "@import url(https://x/y.css); .hero{background:url(https://x/a.png)} .card{border-radius:0;background:url(data:image/png;base64,AA)}" });
  assert(!/@import|https:/.test(design.css) && /border-radius:0/.test(design.css) && /data:image/.test(design.css) && notes.length === 2);
  assert.equal(CK.normalizeDesign({ meter: "ring" }, design).design.css, design.css);
});
t("home widgets can sit above or below the tabs", () => {
  const { design } = CK.normalizeDesign({ home: ["a", { id: "b", at: "bottom" }, "a"] });
  assert.deepStrictEqual(design.home, ["a", "b"]); assert.deepStrictEqual(design.homeAt, { b: "bottom" });
});
t("the bar for a lesson follows the learner", () => {
  const short = CK.lessonBar({ session: "short", practice: "light" }), deep = CK.lessonBar({ session: "long", practice: "heavy" });
  assert(short.minWords < deep.minWords && short.minPractice < deep.minPractice);
  const l = { blocks: [{ t: "md", md: "word ".repeat(260) }, { t: "choice", q: "q", options: ["a", "b"], answer: 0, why: "w" }, { t: "answer", q: "q", accept: ["1"], why: "w" }, { t: "cards", cards: [{ q: "a", a: "b" }, { q: "c", a: "d" }] }] };
  assert.deepStrictEqual(CK.lessonIssues(l, { learner: { session: "short" } }), []); assert(CK.lessonIssues(l, { learner: { session: "long" } }).length >= 2);
  assert.equal(CK.normalizeLearner({ approach: "nonsense", practice: "HEAVY", notes: "x" }).approach, ""); assert.equal(CK.normalizeLearner({ practice: "HEAVY" }).practice, "heavy");
});
t("a course file never carries the learner's profile", () => {
  const imp = CK.importCourse({ course: { title: "T", learner: { approach: "try" }, units: [{ title: "U" }] }, lessons: [] });
  assert.equal(imp.meta.learner.approach, "try"); assert(!("learner" in CK.exportCourse(imp.meta, []).course));
});
t("a created course is checked against its own plan", () => {
  const st = { lessons: 10, unwritten: 0, thinLessons: 1, checkedPerLesson: 2, practiceTypes: 3, cardsPerLesson: 3, runBlocks: 0, drillsPerLesson: 0, checkpoints: 0, proofTasks: 0 };
  const plain = CK.reviewCourse(st, {}), withDrills = CK.reviewCourse(st, { drills: true });
  assert(plain.score >= 90 && withDrills.score < plain.score && !plain.parts.some(p => /Drills|Checkpoints|Project/.test(p.name)));
});
t("course home sections can be reordered and hidden", () => {
  const { design, notes } = CK.normalizeDesign({ tabs: ["plan", "today", "bogus", "plan"], hide: ["timeline"] });
  assert.deepStrictEqual(design.tabs, ["plan", "today"]); assert.deepStrictEqual(design.hide, ["timeline"]); assert(notes.some(n => /bogus/.test(n)));
  assert.deepStrictEqual(CK.normalizeDesign({ meter: "ring" }, design).design.hide, ["timeline"]);
});
t("a lesson may open with one problem to try, then must teach", () => {
  const q = { t: "choice", q: "q", options: ["a", "b"], answer: 0 };
  CK.normalizeLesson({ title: "x", blocks: [q, teach] });
  throwsRule(() => CK.normalizeLesson({ title: "x", blocks: [q, q, teach] }), /open with teaching/);
});
t("long teaching needs practice", () => throwsRule(() => CK.normalizeLesson({ title: "x", blocks: [{ t: "md", md: "word ".repeat(300) }] }), /no practice/));
t("a thin lesson is refused", () => throwsRule(() => CK.normalizeLesson({ title: "x", blocks: [{ t: "md", md: "Hi." }] }), /teaches almost nothing/));
t("choice answers must point at an option", () => throwsRule(() => CK.normalizeBlock({ t: "choice", q: "q", options: ["a", "b"], answer: 5 }), /answer/));
t("widgets may not load outside scripts or frames", () => {
  throwsRule(() => CK.normalizeBlock({ t: "widget", html: '<script src="https://evil.example/x.js"></script>' }), /inline/);
  throwsRule(() => CK.normalizeBlock({ t: "widget", html: '<iframe src="https://x"></iframe>' }), /frames/);
  CK.normalizeBlock({ t: "widget", html: '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script><div id=x></div>' });
});
t("images only from the learner's uploads", () => throwsRule(() => CK.normalizeBlock({ t: "image", asset: "https://x/y.png", alt: "a" }), /uploaded/));
t("answers are compared leniently", () => {
  const b = CK.normalizeBlock({ t: "answer", q: "q", accept: ["Chișinău", "0.25"] });
  assert(CK.checkAnswer(b, "  chișinău. ")); assert(CK.checkAnswer(b, "0.249")); assert(!CK.checkAnswer(b, "0.3"));
  const o = CK.normalizeBlock({ t: "order", q: "q", items: ["a", "b", "c"] }); assert(CK.checkAnswer(o, ["a", "b", "c"])); assert(!CK.checkAnswer(o, ["b", "a", "c"]));
  const c = CK.normalizeBlock({ t: "choice", q: "q", options: ["a", "b", "c"], answer: [2, 0] }); assert(CK.checkAnswer(c, [0, 2])); assert(!CK.checkAnswer(c, [0]));
});
t("recall boxes grow and reset", () => { let s = CK.nextCard(null, true, 0); assert.equal(s.box, 0); s = CK.nextCard(s, true, 0); assert.equal(s.box, 1); s = CK.nextCard(s, false, 0); assert.equal(s.box, 0); });
t("export then import keeps ids and content", () => {
  const imp = CK.importCourse(require("../../courses/music-theory.coursekit.json"), { keepIds: true });
  const back = CK.importCourse(CK.exportCourse(imp.meta, imp.lessons), { keepIds: true });
  assert.deepStrictEqual(back.lessons.map(l => l.blocks.map(b => b.id)), imp.lessons.map(l => l.blocks.map(b => b.id)));
  assert.deepStrictEqual(back.meta.units, imp.meta.units);
});
t("markdown escapes html and refuses unsafe links", () => {
  const h = md('<img src=x onerror=alert(1)> [a](javascript:alert(1)) [b](https://ok.example) **bold** `<b>`');
  assert(!/<img/.test(h)); assert(!/href="javascript/.test(h)); assert(/href="https:\/\/ok.example"/.test(h)); assert(/<strong>bold<\/strong>/.test(h)); assert(/&lt;b&gt;/.test(h));
});
t("markdown tables, lists and math", () => {
  const h = md("| a | b |\n|---|---|\n| 1 | 2 |\n\n- x\n- y\n\n$$\nx^2\n$$", { math: (t, d) => "<m>" + t + "</m>" });
  assert(/<th>a<\/th>/.test(h)); assert(/<li>x<\/li>/.test(h)); assert(/<m>x\^2<\/m>/.test(h));
});
console.log(n + " passed");
