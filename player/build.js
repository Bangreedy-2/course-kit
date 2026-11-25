#!/usr/bin/env node
/* Builds the single-file player page: player/dist/coursekit-player.html */
const fs = require("fs"), path = require("path");
const src = f => fs.readFileSync(path.join(__dirname, "src", f), "utf8");
// app.js and prog.js share one scope; the page starts when both are loaded.
const js = ["core.js", "md.js", "store.js", "run.js"].map(src).join("\n") + "\n(function () {\n\"use strict\";\n" + ["app.js", "prog.js"].map(src).join("\n") + "\nboot();\n})();";
if (/<\/script/i.test(js)) throw new Error("a source file contains a closing script tag");
const html = src("shell.html").replace("/*@CSS@*/", () => src("player.css")).replace("/*@JS@*/", () => js);
fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
const out = path.join(__dirname, "dist", "coursekit-player.html");
fs.writeFileSync(out, html);
console.log("wrote", path.relative(process.cwd(), out), (html.length / 1024).toFixed(1) + " KB");

// The plugin ships the same page and a reference generated from the rules in core.js.
const CK = require("./src/core.js");
const skills = path.join(__dirname, "..", "plugin", "skills");
fs.copyFileSync(out, path.join(skills, "coursekit-player", "coursekit-player.html"));
const ref = "# Coursekit reference\n\nGenerated from `player/src/core.js` by `node player/build.js`. Do not edit by hand.\n\n## Rules as the player states them\n\n" +
  CK.DESIGN_RULES + "\n\n## Blocks\n\n" + CK.BLOCK_DOC + "\n\n## Course modules\n\n" + CK.MODULES_DOC + "\n\n## Design\n\n" + CK.DESIGN_DOC + "\n\n## Limits\n\n" +
  Object.entries(CK.LIMITS).map(([k, v]) => "- " + k + ": " + v).join("\n") + "\n";
fs.writeFileSync(path.join(skills, "coursekit-design", "reference.md"), ref);
console.log("wrote plugin skill files");
