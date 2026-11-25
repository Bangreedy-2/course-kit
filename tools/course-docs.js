#!/usr/bin/env node
/* Turns a course file into the database records the player stores, one JSON
   file per record, so a Claude project (or any tool with database access) can
   install a course straight into a learner's player.
   Usage: node tools/course-docs.js courses/music-theory.coursekit.json out/dir
   Then write each file as document <name without .json> in collection
   data/users/me of the player artifact. */
const fs = require("fs"), path = require("path");
const CK = require("../player/src/core.js");
const [file, outDir] = process.argv.slice(2);
if (!file || !outDir) { console.error("usage: node tools/course-docs.js <course file> <out dir>"); process.exit(1); }
const imp = CK.importCourse(JSON.parse(fs.readFileSync(file, "utf8")), { keepIds: true });
const at = new Date().toISOString(), cid = imp.meta.id;
fs.mkdirSync(outDir, { recursive: true });
const meta = Object.assign({}, imp.meta, { kind: "course", created: at, updated: at, origin: { kind: "imported", by: "project", at } });
delete meta.designNotes;
const write = (key, body) => { fs.writeFileSync(path.join(outDir, key + ".json"), JSON.stringify(body)); console.log(key, JSON.stringify(body).length); };
for (const l of imp.lessons) write("l~" + cid + "~" + l.id, Object.assign({}, l, { kind: "lesson", course: cid, updated: at }));
const mods = imp.mods || {};
const parts = {}; for (const k of ["plan", "drills", "checkpoints", "pages"]) if (mods[k] != null) parts[k] = mods[k];
for (const [id, n] of Object.entries(mods.notebooks || {})) parts["nb." + id] = n;
for (const [part, data] of Object.entries(parts)) write("x~" + cid + "~" + part, { kind: "module", course: cid, part, data, updated: at });
write("c~" + cid, meta); // last, so the course appears once its lessons exist
