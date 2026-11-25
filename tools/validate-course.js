#!/usr/bin/env node
/* Checks course files against the Coursekit design rules.
   Usage: node tools/validate-course.js courses/*.coursekit.json */
const fs = require("fs");
const CK = require("../player/src/core.js");
let bad = 0;
for (const f of process.argv.slice(2)) {
  try {
    const imp = CK.importCourse(JSON.parse(fs.readFileSync(f, "utf8")), { keepIds: true });
    const blocks = imp.lessons.reduce((n, l) => n + l.blocks.length, 0);
    console.log("ok   " + f + ": " + imp.lessons.length + " lessons, " + blocks + " blocks" + (imp.meta.designNotes.length ? "; colours the player will adjust: " + imp.meta.designNotes.join("; ") : ""));
  } catch (e) { bad++; console.log("FAIL " + f + ": " + e.message); }
}
process.exit(bad ? 1 : 0);
