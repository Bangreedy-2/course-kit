# Runtime packs

A course can run code in the page. Some languages need files beside the page to do that; those files are a
**runtime pack**. A fresh Coursekit player ships without packs, so it stays small, and gets a pack the first
time a course needs one.

`registry.json` lists the packs. Each pack has:

- an **artifact**: a plain public page that holds the pack's files and a `pack.json` manifest (path, size and
  SHA-256 of every file);
- a **prefix**: where its files live beside the player (`py/` for Python);
- a **probe**: the one file the player looks for to know the pack is installed;
- a **build** command that recreates the pack from public sources, for when the artifact cannot be used.

## Three ways a language can work

1. **In the page, with a pack.** Python today. Any language with a WebAssembly build can become a pack:
   add its engine to `player/src/run.js`, publish its files as a pack artifact, add it to `registry.json`.
2. **In the page, without a pack.** JavaScript is built in. A course can also carry its own runner as a
   `frame` runtime: one HTML document that receives code and posts back the output. That suits small
   languages with a pure JavaScript interpreter loaded from an allowed CDN.
3. **Not in the page.** Elixir, Rust, C with a real toolchain. The course teaches with predict-the-output
   practice and "run it on your machine and paste the result" checks. Course creation falls back to this
   by itself when the page cannot run the language.

## Installing a pack into a player

See the `coursekit-player` skill ("Runtime packs"). In short: copy every file in the pack's manifest from the
pack artifact into the player artifact, in batches of at most 60 MB, keeping the paths.

## The Python pack

Built from the Pyodide 314.0.8 distribution. Wheels and zips are stored with a `.wasm` suffix because
artifacts refuse `.whl` and `.zip`; `py/sp-worker.js` adds the suffix back when Pyodide fetches them.
`runtimes/python/extra/` holds the files the Pyodide CDN does not serve: the worker, the extended lock file
and a few pure-Python wheels.
