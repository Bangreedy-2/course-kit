# Coursekit

Coursekit is an application that helps you create an interactive course with the help of your AI subscription. Point it at a topic or your own materials (books, PDFs, notes, homework), and it builds a full course. You get deep lessons, hands-on exercises, spaced recall, from-memory drills, timed checkpoints and projects, with your progress saved. Courses are plain files you can edit, version and share. Plugins add whatever a topic needs, from in-browser Python and SQL to GPU notebooks on your own machine. Connect it to Claude Desktop, claude.ai or Claude Code on your normal plan to ask questions, get hints, check your work or reshape the course while you learn.

No API keys are needed. The tutor is the AI subscription you already have.

## Quick start

1. In Claude, open **Customize → Plugins → Add marketplace** and paste `Bangreedy-2/course-kit`. Add the Coursekit plugin.
2. Tell Claude: **Set up Coursekit for me.** It publishes your private player, adds Python, checks it and gives you the link.
3. Open the player, press **New course** and say what you want to learn, with your weekly time and any deadline.

You need a paid Claude plan. Nothing else to install: Python and JavaScript run inside the page.

To learn a language that cannot run in a page (Elixir, C, C++, Rust, Go, Java and more), or to use your own Python libraries and GPU, courses run code on your own computer:

- **Mac or Windows:** open the player in the Claude desktop app and press **Install as app** when a course asks.
- **Linux, Cowork or Claude Code:** add the optional `coursekit-runner` plugin from the same marketplace (`runner/coursekit-runner.js`, Node 18+); then say "connect the runner" to Claude once (the plugin's skill gives your player access to it) and the course shows a **Connect** button. For plain chat in the desktop app, add the runner as a local MCP server named `coursekit`, or install `coursekit-runner.mcpb` (build it with `python3 tools/build-runner-extension.py`).

Code is sent to your computer only when you press Run, and each course must be allowed once. See `docs/publishing.md` for how the landing page, the plugin directory listing and the runtime packs fit together.

## The player

The newest part of Coursekit is the **player**: one private page in your Claude account that holds all your courses. Describe a course and Claude plans it, designs it and writes it. Ask the course's tutor anything from any page, and it can reshape the course while you learn, with every change checked against strict design rules and undoable. Progress follows you to every device. Share a course as a file. See [docs/player.md](docs/player.md).

Ready-made course files are in `courses/`. The plugin in `plugin/` installs the player and carries the course-design rules as skills.

## The local app

### Start

You need Python 3.9 or newer, and nothing else. From the repository root:

```sh
python3 helper/coursekit.py
```

This starts the Coursekit helper and opens <http://127.0.0.1:8737/app/>. The helper:

- serves the app and every course in `packs/`;
- saves your progress and notebooks as files in `~/.coursekit`, so clearing the browser loses nothing;
- runs course code on your own computer, with your own libraries and GPU.

To run code in a specific environment (for example one with CUDA builds of PyTorch), install the course's libraries there and point the helper at its Python:

```sh
pip install -r packs/sigmoid-ml/requirements.txt       # inside that environment
python3 helper/coursekit.py --python ~/envs/ml/bin/python
```

In the app, Record → Settings → Run Python switches between this computer and the browser.

Without the helper, any static web server works (`python3 -m http.server 8000`, then open <http://localhost:8000/app/>). Progress is then kept in the browser, and Python runs in the browser through Pyodide with numpy, pandas, scikit-learn and matplotlib. The first run downloads about 45 MB, which the browser then caches.

## Your AI tutor

- **Ask button:** on every page and every exercise. It writes a message with where you are and your answer so far, copies it and opens Claude. Works with any AI chat.
- **Coursekit tools (MCP):** connect `helper/mcp_server.py` to Claude Desktop or Claude Code and your AI can see the page you are on, read your progress, run your code on your GPU, and create or edit courses.

Setup steps are in [docs/connect-ai.md](docs/connect-ai.md).

## What is in a course

- **Today:** a daily queue of recall cards, drill reviews, the next lesson and any checkpoint that is ready.
- **Plan:** phases and weeks of tasks, each with clear "done when" criteria and a self-check quiz.
- **Lessons:** long-form lessons with practice items. A lesson counts as learned only when every item is correct. Code in lessons can be run in place.
- **Drills:** short from-memory exercises on a spaced-repetition schedule.
- **Checkpoints:** timed mock exams built from earlier items.
- **Projects:** larger tasks, optionally with a notebook that runs your code, checks your work and exports to `.ipynb`, and Streamlit apps that run in the page.
- **Record:** progress by track, checkpoint scores, study-day heatmap, settings and backups.

## Courses included

- **Sigmoid Prep** (`packs/sigmoid-ml`): a 10-week machine learning programme with Python, 18 notebooks and their datasets.
- **Music Theory Basics** (`packs/music-theory`): a 3-week course with no code at all, to show the app works for any subject.

## Make or change a course

Ask your AI ("build a course on X from these files") with the Coursekit tools connected, or write it yourself: a course is a folder of Markdown lessons plus a `course.json` manifest. See [docs/pack-format.md](docs/pack-format.md).

```sh
python3 helper/packtool.py validate   # check every pack for broken references
python3 helper/packtool.py index      # rebuild packs/index.json (the helper does this on the fly)
```

`node tools/pack.js validate` and `node tools/pack.js index` do the same with Node.

Saved progress is keyed by ids, so once people use a course, only add to it: never rename, delete or reorder ids, practice items, recall cards or criteria.

## Repository layout

```
player/             the Coursekit player (single page built from player/src)
courses/            course files for the player
plugin/             plugin with the player and the course-design skills
app/                the learning app (static HTML, CSS and JavaScript, no build step)
packs/              course packs, one folder per course, and index.json
helper/coursekit.py local helper: serves the app, stores progress, runs code
helper/kernel.py    the persistent Python process the helper runs code in
helper/mcp_server.py Coursekit tools for your AI app
helper/packtool.py  lesson parser, validator and index builder
tools/pack.js       the same validator for Node
tests/              parser parity check (node tests/parity.js)
docs/               pack format, AI setup and roadmap
```

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).
