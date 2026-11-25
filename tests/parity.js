// Checks that the Python lesson parser (helper/packtool.py) matches the app's parser (app/js/text.js) on every pack.
"use strict";
const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { loadPack } = require("../tools/pack.js");
const sort = (v) => Array.isArray(v) ? v.map(sort) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sort(v[k])])) : v;
const root = path.join(__dirname, "..", "packs");
let bad = 0;
for (const d of fs.readdirSync(root).filter((d) => fs.existsSync(path.join(root, d, "course.json")))) {
  const js = JSON.stringify(sort(loadPack(path.join(root, d)).lessons));
  const py = JSON.stringify(sort(JSON.parse(execFileSync("python3", [path.join(__dirname, "..", "helper", "packtool.py"), "parse", path.join(root, d)], { maxBuffer: 1 << 28 }).toString())));
  if (js !== py) { bad++; console.log("MISMATCH " + d); } else console.log("parsers agree on " + d);
}
process.exit(bad ? 1 : 0);
