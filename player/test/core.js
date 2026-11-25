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
t("unknown fonts and layouts are refused", () => {
  throwsRule(() => CK.normalizeDesign({ fonts: { body: "Comic Sans" } }), /fonts.body/);
  throwsRule(() => CK.normalizeDesign({ fonts: { body: "Playfair Display" } }), /display-only/);
  throwsRule(() => CK.normalizeDesign({ layout: "grid" }), /layout/);
});
t("course home sections can be reordered and hidden", () => {
  const { design, notes } = CK.normalizeDesign({ tabs: ["plan", "today", "bogus", "plan"], hide: ["timeline"] });
  assert.deepStrictEqual(design.tabs, ["plan", "today"]); assert.deepStrictEqual(design.hide, ["timeline"]); assert(notes.some(n => /bogus/.test(n)));
  assert.deepStrictEqual(CK.normalizeDesign({ meter: "ring" }, design).design.hide, ["timeline"]);
});
t("a lesson must teach before it tests", () => throwsRule(() => CK.normalizeLesson({ title: "x", blocks: [{ t: "choice", q: "q", options: ["a", "b"], answer: 0 }, teach] }), /open with teaching/));
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
