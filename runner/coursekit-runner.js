#!/usr/bin/env node
/* Coursekit runner: a small local MCP server (stdio) that runs a learner's code on their own
   computer, so a Coursekit course can teach any language installed there (and use the GPU).
   No dependencies. It runs only what the Coursekit player sends when the learner presses Run.

   Tools:  runner_info  what this computer can run
           run_code     {lang, code, stdin?, timeout?} -> {ok, out, err, code, ms, timedOut}        */
"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), { spawn, execSync } = require("child_process");
const LANGS = JSON.parse(fs.readFileSync(path.join(__dirname, "langs.json"), "utf8"));
const WIN = process.platform === "win32";
const VERSION = "1.0.0";
const MAX_OUT = 200000;

const pick = (l, k) => (WIN && l[k === "cmd" ? "win" : "winProbe"]) || l[k];
function available() {
  const out = {};
  for (const [id, l] of Object.entries(LANGS)) {
    try { const v = execSync(pick(l, "probe"), { stdio: ["ignore", "pipe", "pipe"], timeout: 8000 }).toString().trim().split("\n")[0]; out[id] = { label: l.label, version: v.slice(0, 80) }; }
    catch (e) { const v = e && e.stderr && e.stderr.toString().trim().split("\n")[0]; if (e && e.status === 0 && v) out[id] = { label: l.label, version: v.slice(0, 80) }; }
  }
  return out;
}
function runCode(a) {
  return new Promise(resolve => {
    const l = LANGS[String(a.lang || "")];
    if (!l) return resolve({ ok: false, out: "", err: "The runner does not know the language \"" + a.lang + "\". It runs: " + Object.keys(LANGS).join(", ") + ".", code: null, ms: 0 });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coursekit-"));
    const file = path.join(dir, "main." + l.ext), exe = path.join(dir, WIN ? "main.exe" : "main.out");
    fs.writeFileSync(file, String(a.code || ""));
    const q = s => "\"" + s + "\"";
    const cmd = pick(l, "cmd").replace(/\{file\}/g, q(file)).replace(/\{exe\}/g, q(exe));
    const limit = Math.min(Math.max(Number(a.timeout) || 60, 1), 600) * 1000;
    const t0 = Date.now(); let out = "", err = "", timedOut = false, done = false;
    const child = spawn(cmd, { cwd: dir, shell: true, windowsHide: true, detached: !WIN, env: Object.assign({}, process.env, { PYTHONUNBUFFERED: "1", PYTHONIOENCODING: "utf-8" }) });
    const finish = code => { if (done) return; done = true; clearTimeout(timer); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
      const clean = s => s.split(dir + path.sep).join("").split(dir).join(".");
      resolve({ ok: code === 0 && !timedOut, out: clean(out), err: timedOut ? "Stopped: the code ran longer than " + limit / 1000 + " s." : clean(err), code, ms: Date.now() - t0, timedOut }); };
    const timer = setTimeout(() => { timedOut = true; try { if (WIN) execSync("taskkill /pid " + child.pid + " /T /F", { stdio: "ignore" }); else process.kill(-child.pid, "SIGKILL"); } catch (e) {} }, limit);
    child.stdout.on("data", d => { if (out.length < MAX_OUT) out += d; });
    child.stderr.on("data", d => { if (err.length < MAX_OUT) err += d; });
    child.on("error", e => { err += String(e.message || e); finish(null); });
    child.on("close", finish);
    if (a.stdin != null) child.stdin.write(String(a.stdin)); child.stdin.end();
  });
}

const TOOLS = [
  { name: "runner_info", description: "What the Coursekit runner on this computer can run: the installed languages and their versions.", inputSchema: { type: "object", properties: {} }, annotations: { readOnlyHint: true, title: "Runner info" } },
  { name: "run_code", description: "Run a program on this computer and return what it printed. Used by the Coursekit player when the learner presses Run. Languages: " + Object.keys(LANGS).join(", ") + ".",
    inputSchema: { type: "object", required: ["lang", "code"], properties: { lang: { type: "string", enum: Object.keys(LANGS) }, code: { type: "string" }, stdin: { type: "string" }, timeout: { type: "number", description: "seconds, default 60, at most 600" } } },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true, title: "Run code" } },
];
async function handle(m) {
  switch (m.method) {
    case "initialize": return { protocolVersion: (m.params && m.params.protocolVersion) || "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "coursekit", version: VERSION } };
    case "ping": return {};
    case "tools/list": return { tools: TOOLS };
    case "tools/call": {
      const name = m.params && m.params.name, args = (m.params && m.params.arguments) || {};
      let res;
      if (name === "runner_info") res = { runner: VERSION, platform: process.platform, arch: process.arch, languages: available() };
      else if (name === "run_code") res = await runCode(args);
      else throw Object.assign(new Error("Unknown tool: " + name), { code: -32602 });
      return { content: [{ type: "text", text: JSON.stringify(res) }], structuredContent: res };
    }
    default: throw Object.assign(new Error("Method not found: " + m.method), { code: -32601 });
  }
}
if (require.main === module) {
  let buf = "", busy = 0, ended = false;
  const settle = () => { busy--; if (ended && !busy) process.exit(0); };
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", async chunk => {
    buf += chunk; let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue;
      let m; try { m = JSON.parse(line); } catch (e) { continue; }
      if (m.id === undefined) continue; // notifications need no answer
      busy++;
      handle(m).then(result => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: m.id, result }) + "\n"),
        e => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: m.id, error: { code: e.code || -32603, message: String(e.message || e) } }) + "\n")).then(settle);
    }
  });
  process.stdin.on("end", () => { ended = true; if (!busy) process.exit(0); });
}
module.exports = { runCode, available, LANGS };
