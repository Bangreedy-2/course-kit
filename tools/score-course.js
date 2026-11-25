#!/usr/bin/env node
/* Scores a course file against a reference course on the measures that carry quality:
   teaching depth, practice, code that is run and checked, drills, plan, checkpoints, projects.
   Usage: node tools/score-course.js <course.coursekit.json> [reference.coursekit.json] */
const fs = require("fs"), path = require("path");
const CK = require("../player/src/core.js");
const [file, refFile = path.join(__dirname, "../courses/cern-prep.coursekit.json")] = process.argv.slice(2);
if (!file) { console.error("usage: node tools/score-course.js <course file> [reference file]"); process.exit(2); }
const load = f => JSON.parse(fs.readFileSync(f, "utf8"));
const a = CK.courseStats(load(file)), b = CK.courseStats(load(refFile));
const res = CK.scoreCourse(a, b);
const pad = (s, n) => String(s).padEnd(n);
console.log(pad("measure", 22) + pad("course", 10) + "reference");
for (const k of Object.keys(a)) console.log(pad(k, 22) + pad(a[k], 10) + b[k]);
console.log("");
for (const p of res.parts) console.log(pad(p.got + "%", 6) + p.name + " (weight " + p.weight + ")");
console.log("\nScore: " + res.score + " / 100");
process.exit(res.score >= 80 ? 0 : 1);
