#!/usr/bin/env node
/* End-to-end test of the built player with a mocked artifact runtime.
   Run: node player/build.js && node player/test/browser.js [screenshot dir] */
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", "..");
const shots = process.argv[2] || null;
const page_html = fs.readFileSync(path.join(root, "player/dist/coursekit-player.html"), "utf8");
const mock = fs.readFileSync(path.join(__dirname, "mock-claude.js"), "utf8");
const html = "<!doctype html><html><head><meta charset=utf8><meta name=viewport content='width=device-width,initial-scale=1'></head><body><script>" + mock + "</script>" + page_html + "</body></html>";

let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "ok   " : "FAIL ") + msg); if (!cond) failures++; };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error" && !/fonts\.g|cdnjs|ERR_|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.route("http://ck.test/", r => r.fulfill({ contentType: "text/html", body: html }));
  await page.route(/fonts\.googleapis|fonts\.gstatic|cdnjs/, r => r.abort());
  await page.goto("http://ck.test/");
  await page.waitForSelector(".empty-lib");
  ok(true, "library shows the empty state");
  if (shots) await page.screenshot({ path: shots + "/1-empty.png" });

  // Import Music Theory
  await page.setInputFiles(".lib-head input[type=file]", path.join(root, "courses/music-theory.coursekit.json"));
  await page.waitForSelector(".hero h1");
  ok((await page.textContent(".hero h1")) === "Music Theory Basics", "import opens the course");
  await page.waitForSelector(".path .stop");
  ok(await page.$(".path"), "music course uses its own path layout");
  const bg = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--bg").trim());
  ok(bg === "#f7f1e6", "course palette applied (" + bg + ")");
  if (shots) await page.screenshot({ path: shots + "/2-course.png", fullPage: true });

  // Lesson: practice items
  await page.click("text=Start: Pitch, note names and the staff");
  await page.waitForSelector(".lesson h1");
  const nPractice = await page.$$eval(".practice", e => e.length);
  ok(nPractice >= 5, "lesson renders " + nPractice + " practice items");
  ok(await page.$(".widget iframe"), "keyboard widget renders in a frame");
  const sandbox = await page.getAttribute(".widget iframe", "sandbox");
  ok(sandbox === "allow-scripts", "widget frame is sandboxed");
  // Answer every choice by trying options until right
  const choiceBlocks = await page.$$(".blk-choice");
  for (const b of choiceBlocks) {
    const opts = await b.$$(".opt");
    for (const o of opts) { await o.click(); if (await b.evaluate(x => x.classList.contains("solved"))) break; }
  }
  ok((await page.$$eval(".blk-choice.solved", e => e.length)) === choiceBlocks.length, "choice items can be solved");
  // Answer items: read accepted answers from the stored lesson
  const lessonDoc = await page.evaluate(() => [...window.__mockDocs].find(([k]) => k.endsWith("l~music-theory~pitch"))[1]);
  for (const b of lessonDoc.blocks.filter(b => b.t === "answer")) {
    await page.fill("#b-" + b.id + " input", "wrong answer"); await page.click("#b-" + b.id + " .btn");
    ok(await page.$eval("#b-" + b.id + " .fb .bad", e => !!e).catch(() => false), "wrong answer is marked");
    await page.fill("#b-" + b.id + " input", b.accept[0].toUpperCase() + "."); await page.click("#b-" + b.id + " .btn");
  }
  for (const b of lessonDoc.blocks.filter(b => b.t === "write")) {
    await page.fill("#b-" + b.id + " textarea", Array(b.min + 2).fill("note").join(" "));
    await page.click("#b-" + b.id + " .row .btn:not([hidden])");
  }
  await page.waitForTimeout(800);
  const end = await page.textContent("#lesson-end");
  ok(/learned/i.test(end), "lesson counts as learned when every item is right: " + end.trim());
  await page.waitForTimeout(3000);
  const prog = await page.evaluate(() => [...window.__mockDocs].find(([k]) => k.endsWith("p~music-theory~pitch")));
  ok(prog && prog[1].done && Object.keys(prog[1].cards).length > 0, "progress saved to the database with recall cards scheduled");
  const stats = await page.evaluate(() => [...window.__mockDocs].find(([k]) => k.endsWith("s~music-theory")));
  ok(stats && stats[1].learned === 1, "course stats saved for the library");
  if (shots) await page.screenshot({ path: shots + "/3-lesson.png", fullPage: false });

  // Graded widget in the intervals lesson
  await page.evaluate(() => location.hash = "#/c/music-theory/l/intervals");
  await page.waitForSelector(".widget iframe");
  await page.waitForTimeout(500);
  const frames = page.frames().filter(f => f !== page.mainFrame());
  const trainer = frames.find(f => f.url().startsWith("about:srcdoc")) && frames[frames.length - 1];
  for (const f of frames) { try { await f.evaluate(() => window.ck && window.ck.done(true)); } catch (e) {} }
  await page.waitForTimeout(400);
  ok((await page.$$eval(".blk-widget.solved", e => e.length)) >= 1, "graded widget reports success through ck.done");
  const isolated = await frames[frames.length - 1].evaluate(() => { try { return !!parent.document.body; } catch (e) { return "blocked"; } });
  ok(isolated === "blocked", "widget cannot reach the page");

  // Ask with edits
  await page.click(".ask-btn");
  await page.waitForSelector("#ask-input");
  await page.evaluate(() => window.__mockTools.push([
    { name: "add_lesson", input: { unit: "w3", title: "The circle of fifths", summary: "Keys arranged by fifths.", minutes: 15, blocks: [
      { t: "md", md: "## The circle\n\nThe circle of fifths arranges the twelve keys so that each step clockwise adds one sharp. Starting from C major with no sharps, G has one, D has two, and so on. Counter-clockwise each step adds a flat: F has one flat, B flat has two. Neighbouring keys share six of their seven notes, which is why music moves between them so smoothly. You can use the circle to find key signatures quickly, to find relative minors, and to predict which chords will sound close to each other in a progression." },
      { t: "choice", q: "How many sharps does D major have?", options: ["One", "Two", "Three"], answer: 1, why: "C, G (1), D (2)." },
      { t: "cards", cards: [{ q: "Which key has one flat?", a: "F major" }] }] } },
    { name: "update_course", input: { design: { palette: { accent: "#f0e6d0" } } } },
    { name: "add_lesson", input: { unit: "w3", title: "Bad lesson", blocks: [{ t: "choice", q: "x", options: ["a"], answer: 0 }] } },
  ]));
  await page.fill("#ask-input", "Add a lesson on the circle of fifths and make the accent lighter");
  await page.click("#ask .btn.primary");
  await page.waitForFunction(() => !window.__ck.ask.busy && !window.__ck.txn);
  await page.waitForTimeout(300);
  const tr = await page.evaluate(() => window.__mockToolResults);
  ok(tr[0] && tr[0].lesson === "the-circle-of-fifths", "add_lesson tool created a lesson");
  ok(/adjusted/.test(String(tr[1])), "design rules corrected a too-faint accent: " + String(tr[1]).slice(0, 120));
  ok(/^Error:/.test(String(tr[2])), "rules rejected a broken lesson: " + String(tr[2]).slice(0, 100));
  const meta = await page.evaluate(() => [...window.__mockDocs].find(([k]) => k.endsWith("c~music-theory"))[1]);
  ok(meta.units[2].lessons.includes("the-circle-of-fifths"), "course outline saved with the new lesson");
  const revs = await page.evaluate(() => [...window.__mockDocs].filter(([k]) => k.includes("v~music-theory")).length);
  ok(revs === 1, "one revision recorded for the change");
  const ctxSent = await page.evaluate(() => window.__mockCalls.filter(c => c.tools && c.tools.length).slice(-1)[0]);
  ok(ctxSent.tools.length <= 16 && ctxSent.input[0].content.includes("Intervals: number and quality"), "Ask sends the course outline and current lesson, " + ctxSent.tools.length + " tools");
  if (shots) await page.screenshot({ path: shots + "/4-ask.png" });
  await page.click("#ask .icon");

  // Undo
  await page.evaluate(() => location.hash = "#/c/music-theory/history");
  await page.waitForSelector(".revs li");
  await page.click(".revs li .btn");
  await page.waitForTimeout(800);
  const meta2 = await page.evaluate(() => [...window.__mockDocs].find(([k]) => k.endsWith("c~music-theory"))[1]);
  const gone = await page.evaluate(() => ![...window.__mockDocs].some(([k]) => k.endsWith("l~music-theory~the-circle-of-fifths")));
  ok(!meta2.units[2].lessons.includes("the-circle-of-fifths") && gone && meta2.design.palette.accent === "#8c2f39", "undo restores the outline, removes the lesson and the design change");

  // Export
  await page.evaluate(() => location.hash = "#/c/music-theory");
  await page.waitForSelector(".hero");
  await page.click("text=Course options");
  await page.click("text=Export course file");
  await page.waitForTimeout(200);
  const dl = await page.evaluate(() => window.__mockDownload && { name: window.__mockDownload.filename, n: JSON.parse(window.__mockDownload.data).lessons.length });
  ok(dl && dl.name === "music-theory.coursekit.json" && dl.n === 6, "export saves a course file");

  // Create a course from a sentence (scripted Claude)
  await page.evaluate(() => {
    window.__mockJson.push({ title: "Espresso at Home", subtitle: "For a home barista", description: "Dial in shots.", language: "en", tutor: { name: "Bea", persona: "Warm." },
      design: { palette: { bg: "#1c1410", surface: "#261b15", ink: "#f3e6d8", muted: "#c8b29e", accent: "#e08a3c", accent2: "#d4b26a" }, fonts: { display: "Fraunces", body: "Work Sans" }, shape: "round", layout: "tabs", pattern: "dots", density: "normal", emblem: "☕" },
      units: [{ title: "Extraction", goal: "Pull a balanced shot", lessons: [{ title: "What extraction is", summary: "Solubles", minutes: 12 }, { title: "Brew ratio", summary: "Dose and yield", minutes: 12 }] }] });
    const lesson = () => ({ summary: "s", minutes: 12, blocks: [{ t: "md", md: "## Idea\n\n" + "Espresso extraction dissolves flavour from coffee grounds into water under pressure. ".repeat(8) }, { t: "choice", q: "What does a finer grind do?", options: ["Slows the flow", "Speeds the flow"], answer: 0 }] });
    window.__mockJson.push(lesson, lesson);
  });
  await page.evaluate(() => location.hash = "#/new");
  await page.fill("#nc-topic", "How espresso extraction works");
  await page.click(".newc .btn.primary");
  await page.waitForFunction(() => location.hash.startsWith("#/c/espresso-at-home"), null, { timeout: 10000 });
  await page.waitForFunction(() => { const l = window.__ck.lessons; return Object.keys(l).length === 2 && Object.values(l).every(x => !x.pending); }, null, { timeout: 10000 });
  ok(true, "a course is planned and every lesson written");
  await page.waitForSelector(".tabbar");
  ok(await page.$(".tabbar"), "the new course uses the tabs layout it chose");
  if (shots) await page.screenshot({ path: shots + "/5-created.png" });

  // Sigmoid: sidebar layout, phone view
  await page.evaluate(() => location.hash = "#/");
  await page.setInputFiles(".lib-head input[type=file]", path.join(root, "courses/sigmoid-ml.coursekit.json"));
  await page.waitForSelector(".hero h1");
  await page.waitForSelector(".lrow");
  await page.evaluate(() => location.hash = "#/c/sigmoid-ml/l/gd");
  await page.waitForSelector(".side");
  ok(await page.$(".side"), "sigmoid course uses the sidebar layout");
  if (shots) await page.screenshot({ path: shots + "/6-sigmoid.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  ok(!overflow, "no horizontal scroll at phone width");
  if (shots) await page.screenshot({ path: shots + "/7-phone.png" });
  await page.evaluate(() => location.hash = "#/");
  await page.waitForSelector(".ccard");
  ok((await page.$$eval(".ccard", e => e.length)) === 3, "library lists 3 courses");
  if (shots) { await page.setViewportSize({ width: 1280, height: 900 }); await page.waitForTimeout(200); await page.screenshot({ path: shots + "/8-library.png" }); }

  // Project command channel
  await page.evaluate(() => { window.__mockDocs.set("data/users/u1/cmd~t1", { kind: "cmd", status: "new", op: "notify", text: "Good work this week. Review is due tomorrow." }); });
  await page.evaluate(() => window.__mockDocs.get("data/users/u1/c~music-theory") && window.__ck.store.put("x~poke", { kind: "poke" }));
  const shown = await page.waitForFunction(() => /Good work/.test(document.querySelector("#banners").textContent), null, { timeout: 5000 }).then(() => true, () => false);
  ok(shown, "a note written by the project appears");
  await page.click(".banner:has-text('Good work') .btn");
  await page.waitForTimeout(200);
  ok((await page.evaluate(() => window.__mockDocs.get("data/users/u1/cmd~t1").status)) === "done", "dismissing marks the command done");

  ok(errors.length === 0, "no page errors" + (errors.length ? ": " + errors.slice(0, 5).join(" | ") : ""));
  await browser.close();
  console.log(failures ? failures + " failed" : "all passed");
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
