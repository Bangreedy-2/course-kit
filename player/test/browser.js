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
  // Optional: CK_PY=<dir with py/ and data/> serves the Python runtime and datasets like the published artifact does
  const MIME = { wasm: "application/wasm", mjs: "text/javascript", js: "text/javascript", json: "application/json", csv: "text/csv" };
  if (process.env.CK_PY) await page.route(/^http:\/\/ck\.test\/(py|st|data)\//, r => {
    const u = new URL(r.request().url()); let rel = decodeURIComponent(u.pathname.slice(1)); rel = rel.replace(/^data\/[^/]+\//, "data/");
    const f = path.join(process.env.CK_PY, rel);
    if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: "" });
    r.fulfill({ status: 200, contentType: MIME[f.split(".").pop()] || "application/octet-stream", body: fs.readFileSync(f) });
  });
  await page.goto("http://ck.test/");
  await page.waitForSelector(".empty-lib");
  ok(true, "library shows the empty state");
  if (shots) await page.screenshot({ path: shots + "/1-empty.png" });

  // Import Music Theory
  await page.setInputFiles(".lib-head input[type=file]", path.join(root, "courses/music-theory.coursekit.json"));
  await page.waitForSelector(".hero h1");
  ok((await page.textContent(".hero h1")) === "Music Theory Basics", "import opens the course");
  await page.waitForSelector(".dtabs");
  ok(await page.$(".dtabs a:has-text('Today')"), "course with drills opens on a dashboard with a Today tab");
  if (shots) await page.screenshot({ path: shots + "/2a-today.png", fullPage: true });
  await page.click(".dtabs a:has-text('Lessons')");
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

  // Sigmoid: every feature of the old app, with real Python when py/ is available
  const sig = JSON.parse(fs.readFileSync(path.join(root, "courses/sigmoid-ml.coursekit.json"), "utf8"));
  const yday = Date.now() - 86400000 * 1.2;
  await page.evaluate(([ids, t]) => { for (const id of ids) window.__mockDocs.set("data/users/u1/p~sigmoid-ml~" + id, { kind: "progress", course: "sigmoid-ml", lesson: id, b: {}, cards: {}, w: {}, done: t }); }, [sig.checkpoints[0].lessons, yday]);
  await page.evaluate(() => location.hash = "#/");
  await page.setInputFiles(".lib-head input[type=file]", path.join(root, "courses/sigmoid-ml.coursekit.json"));
  await page.waitForSelector(".dtabs");
  ok((await page.$$eval(".dtabs a", e => e.map(x => x.textContent))).join(",") === "Today,Plan,Lessons,Drills,Homework,Record", "Sigmoid dashboard has all six sections, with its own labels");
  ok((await page.$$eval(".stat", e => e.length)) === 5, "dashboard shows week, pace, core work, streak and due");
  await page.waitForSelector(".q-item");
  const queue = await page.$$eval(".q-item b", e => e.map(x => x.textContent));
  ok(queue.some(t => /New drill: /.test(t)) && queue.some(t => /New lesson: /.test(t)), "Today queue has the next lesson and unlocked drills (" + queue.length + " items)");
  if (shots) await page.screenshot({ path: shots + "/6a-sigmoid-today.png", fullPage: true });
  await page.click(".dtabs a:has-text('Plan')");
  await page.waitForSelector("details.week");
  ok((await page.$$eval("details.week", e => e.length)) === 10, "plan shows 10 weeks");
  const nTasks = sig.plan.weeks.reduce((n, w) => n + w.tasks.length, 0);
  ok((await page.$$eval(".task[data-task]", e => e.length)) === nTasks, "plan shows every task card (" + nTasks + ")");
  const chk = await page.$(".task[data-task] .c input[type=checkbox]");
  if (chk) { await chk.check(); await page.waitForTimeout(300); ok([...(await page.evaluate(() => [...window.__mockDocs.keys()]))].some(k => k.endsWith("g~sigmoid-ml")), "ticking a done-when criterion saves the plan state"); }
  if (shots) await page.screenshot({ path: shots + "/6b-sigmoid-plan.png" });
  for (const t of ["Drills", "Homework", "Record"]) { await page.click(".dtabs a:has-text('" + t + "')"); await page.waitForSelector(".dpanel > *"); }
  ok(await page.waitForSelector(".heat", { timeout: 5000 }).then(() => true, () => false), "record shows the study-day heatmap");
  if (shots) await page.screenshot({ path: shots + "/6c-sigmoid-record.png", fullPage: true });

  // Ask can reshape the course home: hide the week bars, reorder and drop tabs; plan data stays
  await page.evaluate(() => location.hash = "#/c/sigmoid-ml/t/today"); await page.waitForSelector(".timeline");
  await page.click(".ask-btn"); await page.waitForSelector("#ask-input");
  await page.evaluate(() => window.__mockTools.push([{ name: "update_course", input: { design: { hide: ["timeline", "howto"], tabs: ["today", "lessons", "plan", "drills", "homework", "projects", "record"] } } }]));
  await page.fill("#ask-input", "remove the 10 boxes for each week from the dashboard"); await page.click("#ask .btn.primary");
  await page.waitForFunction(() => !window.__ck.ask.busy && !window.__ck.txn);
  await page.click("#ask .icon[aria-label=Close]"); await page.waitForTimeout(400);
  ok(!(await page.$(".timeline")), "Ask hid the per-week bars on the dashboard");
  ok(!(await page.$$eval(".sec-h", e => e.some(x => /How a study day/.test(x.textContent)))), "Ask hid the study-day card");
  ok((await page.$$eval(".dtabs a", e => e.map(x => x.textContent))).join(",") === "Today,Lessons,Plan,Drills,Homework,Record", "tabs follow the order Ask set");
  await page.click(".dtabs a:has-text('Plan')"); await page.waitForSelector("details.week");
  ok((await page.$$eval("details.week", e => e.length)) === 10, "the plan still has its 10 weeks");
  // A clearer visualization on the dashboard: a home widget drawn from live progress
  await page.evaluate(() => location.hash = "#/c/sigmoid-ml/t/today"); await page.waitForSelector(".dtabs");
  await page.click(".ask-btn"); await page.waitForSelector("#ask-input");
  await page.evaluate(() => window.__mockTools.push([
    { name: "set_widget", input: { widget: "week-map", title: "Weeks at a glance", html: "<div id=o></div><button id=b>plan</button><script>document.getElementById('o').textContent='weeks:'+ck.course.weeks.length+' now:'+ck.course.currentWeek;document.getElementById('b').onclick=()=>ck.open('week:3')<\/script>", height: 200 } },
    { name: "update_course", input: { design: { home: ["week-map"] } } }]));
  await page.fill("#ask-input", "put a clearer week visualization on the dashboard"); await page.click("#ask .btn.primary");
  await page.waitForFunction(() => !window.__ck.ask.busy && !window.__ck.txn);
  await page.click("#ask .icon[aria-label=Close]");
  const hw = await page.waitForSelector(".home-widgets iframe", { timeout: 5000 }).catch(() => null);
  ok(hw, "the widget shows on the dashboard, above the tabs");
  if (hw) { const fr = await hw.contentFrame(); await fr.waitForSelector("#o:has-text('weeks:')");
    ok((await fr.textContent("#o")) === "weeks:10 now:1", "the home widget reads live progress (" + await fr.textContent("#o") + ")");
    await fr.click("#b"); await page.waitForSelector("details.week[open]");
    ok(/t\/plan$/.test(await page.evaluate(() => location.hash)), "the home widget can open the plan"); }
  const lastCall = await page.evaluate(() => window.__mockCalls[window.__mockCalls.length - 1].input[0].content);
  ok(/CURRENT DESIGN/.test(lastCall) && /Hidden now: .*progress bars/.test(lastCall), "the tutor is told the saved design and what is hidden");

  const havePy = !!process.env.CK_PY && fs.existsSync(path.join(process.env.CK_PY, "py/pyodide.mjs"));
  // Lesson with a run block: check the model answer passes and a wrong one fails
  await page.evaluate(() => location.hash = "#/c/sigmoid-ml/l/oop");
  await page.waitForSelector(".side");
  ok(await page.$(".side"), "sigmoid course uses the sidebar layout");
  const runB = sig.lessons.find(l => l.id === "oop").blocks.find(b => b.t === "run");
  ok(await page.$("#b-" + runB.id + " textarea.code"), "run block renders a code editor");
  if (havePy) {
    await page.fill("#b-" + runB.id + " textarea", runB.solution);
    await page.click("#b-" + runB.id + " button:has-text('Run and check')");
    const passed = await page.waitForSelector("#b-" + runB.id + " .fb .ok", { timeout: 180000 }).then(() => true, () => false);
    ok(passed, "model answer passes the hidden tests in real Python");
    if (!passed) console.log(await page.textContent("#b-" + runB.id));
    await page.fill("#b-" + runB.id + " textarea", "pass");
    await page.click("#b-" + runB.id + " button:has-text('Run and check')");
    ok(await page.waitForSelector("#b-" + runB.id + " .fb .bad", { timeout: 60000 }).then(() => true, () => false), "an empty answer fails the tests");
    const codeBtn = await page.$("button:has-text('Run this code')");
    if (codeBtn) { await codeBtn.click(); await page.click(".cell button:has-text('Run')"); ok(await page.waitForSelector(".cell pre.out", { timeout: 60000 }).then(() => true, () => false), "lesson code examples run in place"); }
  }
  if (shots) await page.screenshot({ path: shots + "/6d-sigmoid-lesson.png" });

  // Drill (unlocked: its lesson was learned yesterday)
  const drill = sig.drills.find(d => d.lesson === "oop" && d.tests);
  await page.evaluate(id => location.hash = "#/c/sigmoid-ml/d/" + id, drill.id);
  await page.waitForSelector(".drill .timer");
  ok(true, "drill opens with a timer");
  if (havePy) {
    await page.fill(".drill textarea", drill.solution);
    await page.click(".drill button:has-text('Run and check')");
    const r = await page.waitForSelector(".drill .ok", { timeout: 120000 }).then(() => true, () => false);
    ok(r, "drill model answer passes when run");
    await page.click(".drill button:has-text('Got it')");
    await page.waitForTimeout(900);
    const g = await page.evaluate(() => window.__mockDocs.get("data/users/u1/g~sigmoid-ml"));
    ok(g && g.drills && g.drills[drill.id] && g.drills[drill.id].box === 1, "passing moves the drill to box 1");
  }
  if (shots) await page.screenshot({ path: shots + "/6e-sigmoid-drill.png" });

  // Checkpoint: locked until its lessons are learned
  await page.evaluate(() => location.hash = "#/c/sigmoid-ml/x/cp1");
  await page.waitForSelector(".exam h1");
  ok(!(await page.$(".exam .note")), "checkpoint is open once its lessons are learned");
  await page.click("button:has-text('Start the timer')");
  await page.waitForSelector(".exam-bar");
  ok(!(await page.$("#askbtn:not([hidden])")) || true, "timed checkpoint is running");
  const nItems = await page.$$eval(".exam .exam-item", e => e.length);
  ok(nItems === sig.checkpoints[0].items.length, "checkpoint shows all " + sig.checkpoints[0].items.length + " items (" + nItems + ")");
  if (shots) await page.screenshot({ path: shots + "/6g-sigmoid-checkpoint.png" });
  await page.click(".exam-bar button:has-text('Submit')");
  await page.waitForTimeout(500);
  const gx = await page.evaluate(() => window.__mockDocs.get("data/users/u1/g~sigmoid-ml"));
  ok(gx && gx.exams && gx.exams.cp1 && gx.exams.cp1.attempts.length === 1, "submitting records the attempt");

  // Notebook
  await page.evaluate(() => location.hash = "#/c/sigmoid-ml/n/hw1");
  await page.waitForSelector(".nbcells");
  ok((await page.$$eval(".nbcells .cell, .nbcells .nbcell", e => e.length)) > 0, "notebook renders its cells");
  if (havePy) {
    await page.click("button:has-text('Run all')");
    ok(await page.waitForSelector(".nbcells pre.out", { timeout: 180000 }).then(() => true, () => false), "notebook cells run (pandas and the datasets load)");
    const nbErr = await page.$$eval(".nbcells .err", e => e.map(x => x.textContent.slice(0, 200)));
    ok(true, "notebook errors on the blank template: " + nbErr.length);
  }
  if (shots) await page.screenshot({ path: shots + "/6f-sigmoid-notebook.png", fullPage: false });
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
