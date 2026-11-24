# Coursekit

Coursekit is an application that helps you create an interactive course with the help of your AI subscription. Point it at a topic or your own materials (books, PDFs, notes, homework), and it builds a full course. You get deep lessons, hands-on exercises, spaced recall, from-memory drills, timed checkpoints and projects, with your progress saved. Courses are plain files you can edit, version and share. Plugins add whatever a topic needs, from in-browser Python and SQL to GPU notebooks on your own machine. Connect it to Claude Desktop, claude.ai or Claude Code on your normal plan to ask questions, get hints, check your work or reshape the course while you learn.

No API keys are needed. The tutor is the AI subscription you already have.

## Try it

You need any static web server. From the repository root:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000/app/>. Progress is saved in your browser.

Courses that use Python run real CPython (Pyodide) in the browser, with numpy, pandas, scikit-learn and matplotlib. The first run downloads about 45 MB, which the browser then caches.

## What is in a course

- **Today:** a daily queue of recall cards, drill reviews, the next lesson and any checkpoint that is ready.
- **Plan:** phases and weeks of tasks, each with clear "done when" criteria and a self-check quiz.
- **Lessons:** long-form lessons with practice items. A lesson counts as learned only when every item is correct. Code in lessons can be run in place.
- **Drills:** short from-memory exercises on a spaced-repetition schedule.
- **Checkpoints:** timed mock exams built from earlier items.
- **Projects:** larger tasks, optionally with an in-browser notebook that checks your work and exports to `.ipynb`.
- **Record:** progress by track, checkpoint scores, study-day heatmap and backups.

## Repository layout

```
app/            the learning app (static HTML, CSS and JavaScript, no build step)
packs/          course packs, one folder per course
  index.json    the list of courses the app shows
  sigmoid-ml/   first pack: a 10-week machine learning programme
docs/           pack format and roadmap
tools/pack.js   validate packs and rebuild packs/index.json
```

## Make or change a course

A course is a folder of Markdown lessons plus a `course.json` manifest. See [docs/pack-format.md](docs/pack-format.md).

```sh
node tools/pack.js validate   # check every pack for broken references
node tools/pack.js index      # rebuild packs/index.json after adding a pack
```

Saved progress is keyed by ids, so once people use a pack, only add to it: never rename, delete or reorder ids, practice items, recall cards or criteria.

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).
