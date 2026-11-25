#!/usr/bin/env node
/* Builds the single-file player page: player/dist/coursekit-player.html */
const fs = require("fs"), path = require("path");
const src = f => fs.readFileSync(path.join(__dirname, "src", f), "utf8");
// app.js and prog.js share one scope; the page starts when both are loaded.
// Code between /*ADDON<*/ and /*>ADDON*/ is the link to the local runner. The full build keeps it; the build the
// main plugin ships leaves it out, because that plugin may not refer to a local server.
const jsAll = ["core.js", "md.js", "store.js", "run.js"].map(src).join("\n") + "\n(function () {\n\"use strict\";\n" + ["app.js", "prog.js"].map(src).join("\n") + "\nboot();\n})();";
const ADDON = /\/\*ADDON<\*\/[\s\S]*?\/\*>ADDON\*\/\n?/g;
const js = jsAll.replace(/\/\*(ADDON<|>ADDON)\*\/\n?/g, ""), jsPlain = jsAll.replace(ADDON, "");
if (/host:|\bmcp\b|Coursekit runner/i.test(jsPlain)) throw new Error("the plain build still refers to the local runner");
if (/<\/script/i.test(js)) throw new Error("a source file contains a closing script tag");
const html = src("shell.html").replace("/*@CSS@*/", () => src("player.css")).replace("/*@JS@*/", () => js);
fs.mkdirSync(path.join(__dirname, "dist"), { recursive: true });
const out = path.join(__dirname, "dist", "coursekit-player.html");
fs.writeFileSync(out, html);
console.log("wrote", path.relative(process.cwd(), out), (html.length / 1024).toFixed(1) + " KB");

// The plugin ships the same page and a reference generated from the rules in core.js.
const CK = require("./src/core.js");
const skills = path.join(__dirname, "..", "plugin", "skills");
// The plugin directory inspects files up to 256 KiB, so the plugin carries the page in parts: a small page
// that loads its own code from text files published beside it. The single-file page in dist/ is the same code.
function writeSplit(dir, code) {
  fs.mkdirSync(dir, { recursive: true });
  const MAX = 200 * 1024; const parts = [];
  for (let i = 0; i < code.length;) { let j = Math.min(code.length, i + MAX); if (j < code.length) { const nl = code.lastIndexOf("\n", j); if (nl > i) j = nl + 1; } parts.push(code.slice(i, j)); i = j; }
  for (const f of fs.readdirSync(dir)) if (/^player-code-\d+\.txt$/.test(f)) fs.unlinkSync(path.join(dir, f));
  parts.forEach((p, i) => fs.writeFileSync(path.join(dir, "player-code-" + (i + 1) + ".txt"), p));
  const loader = "(function () {\n  var n = " + parts.length + ", got = [];\n  function fail(e) { document.getElementById(\"main\").textContent = \"Coursekit could not load its code (\" + e + \"). The player was published without its player-code files: ask Claude to set up Coursekit again.\"; }\n" +
    "  function get(i) { return fetch(\"player-code-\" + (i + 1) + \".txt\").then(function (r) { if (!r.ok) throw new Error(\"part \" + (i + 1) + \" missing\"); return r.text(); }).then(function (t) { got[i] = t; }); }\n" +
    "  var all = []; for (var i = 0; i < n; i++) all.push(get(i));\n  Promise.all(all).then(function () { var s = document.createElement(\"script\"); s.textContent = got.join(\"\"); document.body.appendChild(s); }, fail);\n})();";
  const page = src("shell.html").replace("/*@CSS@*/", () => src("player.css")).replace("/*@JS@*/", () => loader);
  const old = path.join(dir, "coursekit-player.html"); if (fs.existsSync(old)) fs.unlinkSync(old);
  fs.writeFileSync(path.join(dir, "coursekit-player-page.txt"), page);
  console.log("wrote", path.relative(process.cwd(), dir), "page", (page.length / 1024).toFixed(1) + " KB and", parts.length, "code parts");
}
writeSplit(path.join(skills, "coursekit-player"), jsPlain);
// The runner plugin carries the full page, which its connect skill publishes over the plain one.
writeSplit(path.join(__dirname, "..", "runner", "skills", "coursekit-runner-connect"), js);
const ref = "# Coursekit reference\n\nGenerated from `player/src/core.js` by `node player/build.js`. Do not edit by hand.\n\n## Rules as the player states them\n\n" +
  CK.DESIGN_RULES + "\n\n## Blocks\n\n" + CK.BLOCK_DOC + "\n\n## Course modules\n\n" + CK.MODULES_DOC + "\n\n## Design\n\n" + CK.DESIGN_DOC + "\n\n## Limits\n\n" +
  Object.entries(CK.LIMITS).map(([k, v]) => "- " + k + ": " + v).join("\n") + "\n";
fs.writeFileSync(path.join(skills, "coursekit-design", "reference.md"), ref);
console.log("wrote plugin skill files");

// The runner (plugin MCP server and desktop extension) uses the same language table as the page.
const runner = path.join(__dirname, "..", "runner");
fs.mkdirSync(runner, { recursive: true });
fs.writeFileSync(path.join(runner, "langs.json"), JSON.stringify(CK.LOCAL_LANGS, null, 1) + "\n");
console.log("wrote runner/langs.json");
