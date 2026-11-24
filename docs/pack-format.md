# Course pack format

A course pack is a folder under `packs/`. Everything about a course lives in it: the plan, the lessons, the drills, the projects and any data files. The app has no topic-specific code, so a new course is only a new folder.

```
packs/<id>/
  course.json        the manifest: title, schedule, tracks, phases, weeks, tasks, quizzes, checkpoints
  lessons/*.md       one lesson per file, in the lesson format below
  drills.json        optional: from-memory drills with spaced repetition
  notebooks.json     optional: notebook templates for projects (needs the python runtime)
  data/              optional: data files the lessons and notebooks read
```

After adding or renaming a pack, run `node tools/pack.js index` so the app lists it, and `node tools/pack.js validate` to check its references.

## Ids are forever

Saved progress is keyed by lesson, drill, task and checkpoint ids, and by the position of practice items, recall cards, quiz questions and task criteria. Once people are using a pack:

- never rename or delete an id, and never reorder practice items, recall cards or criteria;
- add new items at the end;
- to retire something, hide it instead of removing it.

## course.json

```json
{
  "format": 1,
  "id": "my-course",
  "title": "My Course",
  "subtitle": "Short line shown above the title",
  "description": "One or two sentences for the course list.",
  "assistantName": "Tutor",
  "runtimes": ["python"],
  "schedule": { "start": "2026-11-23", "unit": "week" },
  "labels": { "unit": "Week", "lessons": "Lessons", "drills": "Drills", "projects": "Projects", "project": "Project", "projectsIntro": "…" },
  "linkHosts": ["github.com"],
  "tracks": { "core": "Core ideas", "practice": "Practice" },
  "phases": [ { "id": "p1", "title": "Phase 1", "weeks": [1, 2], "goal": "…" } ],
  "weeks": [ { "n": 1, "title": "…", "goal": "…", "light": false, "quizMax": 1, "tasks": [ … ], "quiz": [ … ] } ],
  "exams": [ … ],
  "lessons": ["lessons/01-intro.md", "lessons/02-next.md"],
  "drills": "drills.json",
  "notebooks": "notebooks.json",
  "data": ["heart.csv"],
  "localCode": { "lessonid#3": "code to prefill for local item 3" },
  "python": { "packages": { "import_name": "pypi-name" } }
}
```

| Field | Meaning |
|---|---|
| `runtimes` | Add-ons the course needs. `python` turns on runnable code in lessons, `@run` and `@local` exercises, run-checked drills and notebooks. Leave it empty for a course with no code. |
| `schedule.start` | Default start date (each learner can change it). Weeks are counted from it. |
| `labels` | Words the app uses. A language course might call projects "Assignments"; a 6-session workshop might set `unit` to "Session". |
| `linkHosts` | Default allowed hosts for link criteria (`U`). An empty list accepts any https link. |
| `python.packages` | Libraries that are not built into Pyodide, installed from PyPI the first time code imports them. |

### Tasks

Each week has tasks. A task is done when all its criteria are met.

```json
{ "id": "w1-intro", "track": "core", "core": true, "h": 1.5,
  "title": "…", "desc": "Markdown allowed",
  "lessons": ["intro"], "res": [["Link label", "https://…"]],
  "project": "1",
  "crit": [ { "t": "L", "id": "intro" }, { "t": "T", "label": "Write a summary", "min": 60 } ] }
```

`core` tasks count towards overall progress; the rest are stretch work. `h` is the expected hours. Tasks with a `project` value also appear on the Projects tab under that number.

| Criterion | Done when |
|---|---|
| `{"t":"L","id":…}` | the lesson is learned (every practice item correct) |
| `{"t":"D","id":…}` | the drill has been passed from memory at least once |
| `{"t":"QZ","w":n,"max":k}` | week n's self-check quiz has at most k wrong |
| `{"t":"X","id":…}` | the checkpoint is passed |
| `{"t":"DAYS","n":k,"w":n}` | the learner studied on at least k days of week n |
| `{"t":"U","label":…,"hosts":[…]}` | a link on one of the hosts is pasted (or the task's notebook passes its checks) |
| `{"t":"T","label":…,"min":words,"lines":n,"expect":[…],"mono":true}` | the text is long enough and contains every `expect` string |
| `{"t":"N","label":…,"min":a,"max":b,"unit":…}` | a number between a and b is entered |
| `{"t":"C","label":…}` | the learner ticks it |

### Weekly quiz

```json
{ "q": "Question (Markdown)", "o": ["option", "option"], "a": 1, "why": "Shown after submitting" }
```

### Checkpoints

Timed mock exams built from existing practice items and drills.

```json
{ "id": "cp1", "title": "Checkpoint 1", "week": 4, "minutes": 75, "pass": 70,
  "lessons": ["intro", "next"], "items": ["intro#2", "next#0", "D:d-drill"] }
```

A checkpoint unlocks when all its `lessons` are learned. Items are `lessonid#index` (a practice item) or `D:drillid`.

## Lesson format

One file per lesson. The first line names the lesson:

```
=== <id> | <track> | <week> | <title> | <drill ids, comma separated>
@@ One line under the title: reading time, sources, related project
## A heading

Body in Markdown: paragraphs, **bold**, *italics*, `code`, [links](https://…), lists, tables,
> callouts, fenced code blocks, and $$ … $$ blocks for formulas.

--- practice
@choice
Which is right?
- wrong option
* right option
- wrong option
! Explanation shown when it is answered correctly.

@answer
What is the capital of Moldova?
= Chișinău
=| Chisinau
! Short answers ignore case and a trailing full stop. `=|` lines are accepted alternatives.

@write
Explain X from memory.
min: 60
```solution
A model answer shown after submitting.
```

--- recall
Q: A question asked days later.
A: Its answer.
```

Practice item types:

| Type | Learner does | Checked by |
|---|---|---|
| `@choice` | picks one option (`*` marks the right one) | exact match |
| `@answer` | types a short answer | match against `=` and `=|` lines, ignoring case |
| `@predict` | types the exact output of a program | match against the `=` lines, whitespace-normalised |
| `@write` | writes an explanation | word count (`min:`), then compares with the model answer |
| `@run` | writes code that runs against hidden tests (python) | ```` ```test ```` output must equal the `=` lines; numbers compared to the expected precision |
| `@local` | runs code and pastes the output (python, or any tool on their machine) | output contains every `=` line and has at least `min:` lines |

`@run` items also take ```` ```starter ```` and ```` ```solution ```` blocks. Recall cards come back after 1, 4, 11, 25 and 55 days once the lesson is learned.

## drills.json

From-memory drills, reviewed on a Leitner schedule (boxes 0 to 5, next review after 1, 3, 7, 14 or 30 days). A drill unlocks the day after its lesson is learned.

```json
[{ "id": "d-capital", "lesson": "intro", "track": "core", "week": 1, "level": 1, "mins": 5,
   "title": "…", "prompt": "Markdown", "hints": ["…"], "starter": "",
   "solution": "model answer", "format": "text",
   "tests": "python test code (optional)", "expect": ["expected output lines"] }]
```

Drills with `tests` are checked by running them (python runtime). Drills without tests are self-graded: the learner writes from memory, compares with the model answer and rates themselves. `"format": "text"` gives a prose box instead of a code box.

## notebooks.json

Notebook templates for project tasks, keyed by task id (python runtime). Learners edit and run cells in the browser, then press Check my work.

```json
{ "hw1": { "title": "…", "v": 1, "datasets": ["heart.csv"],
  "cells": [ { "t": "md", "src": "…" }, { "t": "code", "src": "…" }, { "t": "md", "src": "…", "tag": "why" }, { "t": "code", "src": "…", "tag": "app" } ],
  "checks": [ { "label": "…", "test": "python expression" }, { "label": "…", "test": { "figs": 2 } }, { "label": "…", "test": { "md": "why", "words": 40 } }, { "label": "…", "test": { "app": true } } ],
  "fill": { "1": "python expression whose value goes into criterion 1", "2": { "md": "why" } },
  "prelude": "optional python run before the checks" } }
```

A cell tagged `app` is a Streamlit script that runs in the browser with ▶ Launch app. Any other tag marks a written-answer cell.
