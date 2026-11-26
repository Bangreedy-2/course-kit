---
name: coursekit-player
description: Install or update the Coursekit player (one private artifact that holds all of a learner's courses), install course files into it, and control it from a Claude project (notes, requests, reading progress). Use when someone wants Coursekit, wants a course installed, or wants their project to act on their courses.
---

# The Coursekit player

The player is one page, published as a private artifact in the learner's own Claude account. It holds every course as records in the artifact's database, so the same courses and progress appear on every device signed in to that account. Inside it, the learner creates courses by describing them, imports course files, learns, reviews, and asks the course's tutor, who can also change the course (see the `coursekit-design` skill for the rules).

Requirements: a paid Claude plan (artifact storage and Claude inside artifacts are not on Free).

## Install or update the player

The page is stored as [coursekit-player-page.txt](coursekit-player-page.txt) (a text file holding the complete HTML page). Copy it byte for byte to a working file named `coursekit-player.html`, without reading it into the conversation or changing it, and publish that copy as the artifact's page, together with every `player-code-N.txt` file that sits beside it in this skill folder, each published under its own name next to the page (the `files` map: `{"player-code-1.txt": "<path to it>", …}`). The page loads its code from those files, so a page published without them shows an error. Use these capabilities:

```json
{
  "db": {}, "user": {}, "sample": {}, "downloads": true, "assets": {}
}
```

When you update a player that already has more capabilities than these, keep the ones it has. For a first setup, use the `coursekit-setup` skill, which does every step.

Title it "Coursekit", icon "book". To update an existing player, publish the new page and its `player-code-N.txt` files to the same artifact URL. Courses and progress live in the database and survive every update. Never edit the page to add a course: courses are data.

## Runtime packs (Python and other languages)

The player runs JavaScript by itself. Other languages need a **runtime pack**: files that sit beside the page. A new player has none. Install a pack when the learner asks ("Install the Python pack in my Coursekit player"), when the player shows a note that a pack is missing, or when you install a course whose `runtimes` use the `pyodide` engine.

Python is the one pack this skill installs, pinned to one exact build:

- pack artifact: https://claude.ai/artifact/LvxxaxBuXPqgTVHrvdmiha
- version: Pyodide 314.0.8
- SHA-256 of its `pack.json`: `3522a3b07aa2b1190b46edc4d9b379948e87dac9bbb39d34885ad0984132ceb7`
- files go under `py/` beside the player page, 64 files, about 73 MB; `pack.json` lists every file with its size and SHA-256

**Install by copying from the pack artifact.** Read `pack.json` from the pack artifact and check that its version and SHA-256 are the ones above. If either differs, stop and tell the learner the pack has changed and this plugin needs an update; do not install it. Then publish to the learner's player artifact URL with the player page unchanged and a `files` map that copies each listed path from the pack artifact, `{"py/<name>": {"artifact": "<pack artifact URL>", "path": "py/<name>"}}`. One publish carries at most 64 MB, so split the list into two publishes of under 60 MB each. Files already in the player stay; nothing is downloaded.

**If the copy is refused** (the learner cannot open the pack artifact, or the copy fails), do not fetch the pack from anywhere else. Tell the learner that Python exercises will work once the pack can be copied, and that everything else works without it.

Afterwards tell the learner to reload the player. Check with one read of `py/pyodide-lock.json` from the player artifact. Never rename pack files: wheels and zips carry a `.wasm` suffix on purpose.

A language with no pack still works as a course: lessons use predict-the-output practice and run-on-your-machine checks. Do not promise in-page execution for it.

## Install a course into the player

Tell the learner to press "Import a course file" in the player's library and pick the `.coursekit.json` file. The player checks the file and shows the course at once.

## Records

All records are in the learner's private collection `data/users/<id>` (`data/users/me` for the owner's own project). Every record has a `kind`.

| Document id | kind | What it holds |
|---|---|---|
| `c~<course>` | course | title, design, tutor, units (with lesson order), widgets |
| `l~<course>~<lesson>` | lesson | title, summary, minutes, blocks; `pending: true` = not written yet; `rewrite: "…"` = queued for rewriting |
| `p~<course>~<lesson>` | progress | `b` per block {ok, n tries, a last answer}, `cards` recall schedule, `done` time |
| `s~<course>` | stats | learned, started, due cards, last lesson |
| `h~<course>` | chat | the Ask conversation |
| `v~<course>~<time>` | rev | an undoable change: the records as they were before it |
| `log~<yyyy-mm-dd>` | log | the day's events: open, check (with ok), learned, review, ask, edit, written |
| `cmd~<id>` | cmd | a command from the project (below) |

## Controlling the player from a project

The page cannot message a project, but the project can write to the page and read what happened.

- **Read progress:** query `data/users/me` for `kind == "log"` (recent days) or `kind == "stats"`; read `p~…` records for detail.
- **Send a command:** create `cmd~<any id>` with `kind: "cmd"`, `status: "new"` and one of:
  - `{"op": "notify", "text": "…"}` shows a note;
  - `{"op": "open", "course": "…", "lesson": "…", "text": "…"}` suggests a lesson;
  - `{"op": "ask", "course": "…", "text": "…"}` asks the course's tutor to do something (the learner presses "Do it"; the tutor then edits the course with the rules enforced and an undo point);
  - `{"op": "write", "course": "…"}` offers to write lessons that are pending or queued for rewriting;
  - `{"op": "import", "file": {course file}}` adds a course (files under 250 KB).
  The page sets `status` to `done` or `dismissed`.
- **Edit records directly** only for small, safe fixes, and keep every rule in `coursekit-design`. Prefer an `ask` command so the change gets an undo point.

A nightly scheduled task in the learner's project can read the logs, decide what to review or strengthen, and leave `notify` or `ask` commands for the next session.
