#!/usr/bin/env node
/* Builds a runtime pack on disk from public sources, for publishing beside a Coursekit player.
   This is the fallback when the pack's artifact cannot be copied from: every file is fetched from the
   Pyodide CDN and checked against the pack's manifest; the few files the CDN does not have come from
   runtimes/<pack>/extra/ in this repository.
   Usage: node tools/runtime-pack.js python <out dir>     (writes <out dir>/py/...) */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const [name = "python", out] = process.argv.slice(2);
if (!out) { console.error("usage: node tools/runtime-pack.js <pack> <out dir>"); process.exit(2); }
const dir = path.join(__dirname, "../runtimes", name);
const man = JSON.parse(fs.readFileSync(path.join(dir, "pack.json"), "utf8"));
const CDN = "https://cdn.jsdelivr.net/pyodide/v" + man.version + "/full/";
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
(async () => {
  let fromCdn = 0, fromRepo = 0; const bad = [];
  for (const f of man.files) {
    const base = path.basename(f.path), dest = path.join(out, f.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest) && sha(fs.readFileSync(dest)) === f.sha256) { continue; }
    const local = path.join(dir, "extra", base);
    if (fs.existsSync(local)) { const b = fs.readFileSync(local); if (sha(b) === f.sha256) { fs.writeFileSync(dest, b); fromRepo++; continue; } }
    // Artifacts refuse .whl and .zip, so those are stored with a .wasm suffix; the CDN has the plain name.
    const remote = /\.(whl|zip)\.wasm$/.test(base) ? base.replace(/\.wasm$/, "") : base;
    try {
      const r = await fetch(CDN + remote); if (!r.ok) throw new Error("HTTP " + r.status);
      const b = Buffer.from(await r.arrayBuffer()); if (sha(b) !== f.sha256) throw new Error("differs from the manifest");
      fs.writeFileSync(dest, b); fromCdn++;
    } catch (e) { bad.push(f.path + " (" + e.message + ")"); }
  }
  fs.writeFileSync(path.join(out, "pack.json"), JSON.stringify(man, null, 1));
  console.log(man.files.length + " files in the pack: " + fromCdn + " fetched, " + fromRepo + " from the repository, " + bad.length + " missing");
  if (bad.length) { console.log(bad.join("\n")); process.exit(1); }
})();
