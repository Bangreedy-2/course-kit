# The Coursekit player

The player is Coursekit's main app: one page that lives in your own Claude account as a private artifact and holds every course you make or import. The course is data and the page is a player, so making or reshaping a course never needs a rebuild.

## What it does

- **Library.** All your courses, each drawn in its own design, with progress and cards due.
- **New course.** Describe what you want to learn, add notes or PDFs if you like, and Claude plans the course, chooses its design and tutor, and writes each lesson with practice and recall cards. You can start lesson 1 while the rest are written.
- **Lessons.** Prose, callouts, code, formulas, images, interactive widgets, and practice: multiple choice, short answers, ordering, matching, written answers graded by the tutor, and hands-on tasks. A lesson counts as learned when every practice item is right.
- **Review.** Recall cards come back after 1, 3, 7, 16, 35 and 80 days.
- **Ask.** A drawer on every page talks to the course's own tutor with the outline, the lesson you are reading, your answers and your progress in view. It can also change the course: add or rewrite lessons, add practice, build widgets, restyle the course. Every change it makes is checked against the design rules and can be undone from **Course options → Changes and undo**.
- **Sync.** Courses and progress are stored in the artifact's database under your account, so the same state appears in the browser, the desktop app and the phone app.
- **Sharing.** **Course options → Export course file** saves a `.coursekit.json` file with the lessons, design and widgets, without your progress. Anyone with the player imports it with **Import a course file** and owns their copy.
- **Your project.** A Claude project with access to the player can read your activity log and progress and leave notes or requests that appear in the page. See `plugin/skills/coursekit-player/SKILL.md`.

You need a paid Claude plan: artifact storage and Claude inside artifacts are not available on Free.

## The design rules

Every change to a course passes through `player/src/core.js`, whoever makes it. It enforces:

- readable colours (text contrast at least 7:1, secondary text 4.5:1, accents 3:1; faint colours are corrected, not rejected);
- fonts, layouts, shapes, patterns and densities from fixed lists;
- lessons that open with teaching and, once they teach anything substantial, include practice;
- well-formed practice (a right answer that exists, distinct options, 3-8 items to order or match);
- widgets that are one self-contained document, run in a sandboxed frame, and load scripts only from cdnjs, jsDelivr or unpkg;
- images only from the learner's own uploads;
- learner work kept: blocks someone has answered are not removed unless the learner asked.

The prose version of the rules is the `coursekit-design` skill in `plugin/skills/`, and `node player/build.js` regenerates its reference from the code.

## Build and test

```sh
node player/build.js            # writes player/dist/coursekit-player.html and the plugin copy
node player/test/core.js        # rules, answer checking, Markdown
node player/test/browser.js     # the whole page in Chromium with a mocked Claude runtime (needs Playwright)
node tools/validate-course.js courses/*.coursekit.json
```

## Course files from the older packs

`node tools/convert-pack.js <pack-id>` turns `packs/<id>/` into `courses/<id>.coursekit.json`. The design, tutor and extra widgets for each converted course come from `tools/designs/<id>.json`. Python notebooks and timed checkpoints are not converted yet; the code exercises become hands-on tasks with model solutions.

## Install

Install the `coursekit` plugin from this repository (it is a plugin marketplace), then ask Claude to install the Coursekit player. The `coursekit-player` skill publishes the page with the `db`, `user`, `sample` and `downloads` capabilities. To install a course from a project, `node tools/course-docs.js <course file> <dir>` writes the database records to load.
