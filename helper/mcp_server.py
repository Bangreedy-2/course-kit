#!/usr/bin/env python3
"""Coursekit MCP server: lets your AI app see and shape your courses.

Connect it to Claude Desktop, Claude Code or any MCP client that runs local
servers. It talks over stdio and uses no API keys: the AI is the subscription
you already use in that app.

    claude mcp add coursekit -- python3 /path/to/course-kit/helper/mcp_server.py

Claude Desktop (claude_desktop_config.json):

    {"mcpServers": {"coursekit": {"command": "python3", "args": ["/path/to/course-kit/helper/mcp_server.py"]}}}

Reading courses and progress works on its own. Seeing where you are in the app
and running code need the helper (helper/coursekit.py) to be running.
Standard library only.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import packtool  # noqa: E402

VERSION = "0.1.0"
ROOT = Path(__file__).resolve().parent.parent
HOME = Path(os.environ.get("COURSEKIT_HOME") or Path.home() / ".coursekit").expanduser()


def _helper_packs():
    try:
        return json.loads((HOME / "helper.json").read_text("utf-8")).get("packs")
    except (OSError, ValueError):
        return None


PACKS = Path(os.environ.get("COURSEKIT_PACKS") or _helper_packs() or ROOT / "packs").expanduser().resolve()
SAFE = re.compile(r"^[a-z0-9][a-z0-9-]{0,63}$")
EDITABLE = (".md", ".json", ".csv", ".txt")

INSTRUCTIONS = """Coursekit is the learner's course app. Use these tools to tutor them and to build or change courses.

Tutoring: call get_current_context first to see the course, lesson, exercise, their answer and recent errors. Teach rather than tell: ask a guiding question or give a hint before a full solution, unless they ask for the answer. Exercise solutions in the context are for you; do not reveal them unprompted. Never help during a checkpoint (context.checkpoint.inProgress).

Courses: read get_format_guide before creating or editing a pack. Packs are folders of Markdown lessons plus course.json. Once a pack is in use, ids are forever: never rename, delete or reorder lesson, drill, task or checkpoint ids, practice items, recall cards or criteria; only append. Run validate_course after every change and fix every error."""


# ---------- helpers

def pack_dir(course):
    if not SAFE.match(course or ""):
        raise ValueError("course ids are lower-case letters, digits and dashes")
    return PACKS / course


def existing_pack(course):
    d = pack_dir(course)
    if not (d / "course.json").is_file():
        raise ValueError("no course '%s'. Known: %s" % (course, ", ".join(p.name for p in packtool.pack_dirs(PACKS))))
    return d


def safe_file(course, rel):
    d = existing_pack(course)
    p = (d / rel).resolve()
    if d.resolve() not in p.parents:
        raise ValueError("path must stay inside the course folder")
    if p.suffix not in EDITABLE:
        raise ValueError("only %s files can be edited" % ", ".join(EDITABLE))
    return p


def helper_call(path, body):
    try:
        h = json.loads((HOME / "helper.json").read_text("utf-8"))
    except (OSError, ValueError):
        raise RuntimeError("The Coursekit helper is not running. Start it with: python3 helper/coursekit.py")
    req = urllib.request.Request(h["url"] + path, data=json.dumps(body).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "X-Coursekit-Token": h["token"]})
    try:
        with urllib.request.urlopen(req, timeout=body.get("timeout", 600) + 30) as r:
            return json.loads(r.read())
    except urllib.error.URLError as e:
        raise RuntimeError("The Coursekit helper did not answer (%s). Is it still running?" % e)


def progress(course):
    f = HOME / "progress" / (course + ".json")
    return json.loads(f.read_text("utf-8")) if f.is_file() else None


def summarize_progress(course):
    c, lessons, drills, _ = packtool.load_pack(existing_pack(course))
    s = progress(course)
    if not s:
        return {"course": course, "note": "No saved progress on this computer yet (the helper saves it while the app is open)."}
    learned = [l["id"] for l in lessons if (s.get("lessons") or {}).get(l["id"], {}).get("learned")]
    weak = []
    for l in lessons:
        for k, st in ((s.get("prac") or {}).get(l["id"]) or {}).items():
            if st.get("tries", 0) >= 2:
                weak.append({"lesson": l["id"], "item": int(k), "tries": st["tries"], "correct": bool(st.get("ok"))})
    out = {
        "course": course, "title": c.get("title"), "start": s.get("start"),
        "lessonsLearned": "%d of %d" % (len(learned), len(lessons)), "learned": learned,
        "nextLesson": next((l["id"] + ": " + l["title"] for l in lessons if l["id"] not in learned), None),
        "itemsThatTookSeveralTries": weak[:40],
        "drills": {d["id"]: {k: v for k, v in ((s.get("drills") or {}).get(d["id"]) or {}).items() if k in ("box", "passes", "attempts", "due")}
                   for d in drills if (s.get("drills") or {}).get(d["id"])},
        "checkpoints": s.get("exams") or {}, "quizzes": s.get("quiz") or {},
        "studyDays": sorted((s.get("log") or {}).keys())[-30:],
    }
    return out


def lesson_text(course, lesson_id):
    d = existing_pack(course)
    c = json.loads((d / "course.json").read_text("utf-8"))
    for f in c.get("lessons", []):
        txt = (d / f).read_text("utf-8")
        if any(l["id"] == lesson_id for l in packtool.parse_lessons(txt)):
            return f, txt
    raise ValueError("no lesson '%s' in %s" % (lesson_id, course))


# ---------- tools

def t_get_current_context(a):
    f = HOME / "context.json"
    if not f.is_file():
        return "No context yet. Start the helper (python3 helper/coursekit.py) and open a course in the app."
    ctx = json.loads(f.read_text("utf-8"))
    course = (ctx.get("course") or {}).get("id")
    extra = {}
    try:
        lid = (ctx.get("exercise") or {}).get("lesson") or (ctx.get("lesson") or {}).get("id")
        if course and lid:
            fname, txt = lesson_text(course, lid)
            extra["lessonFile"] = fname
            extra["lessonMarkdown"] = txt if len(txt) < 60000 else txt[:60000] + "\n…"
            if ctx.get("exercise"):
                l = next(l for l in packtool.parse_lessons(txt) if l["id"] == lid)
                p = l["practice"][ctx["exercise"]["index"]]
                extra["forTutorOnly"] = {k: p.get(k) for k in ("expect", "alts", "solution", "why", "test") if p.get(k)}
        if course and ctx.get("drill"):
            _, _, drills, _ = packtool.load_pack(existing_pack(course))
            d = next((x for x in drills if x["id"] == ctx["drill"]["id"]), None)
            if d:
                extra["forTutorOnly"] = {"solution": d.get("solution"), "hints": d.get("hints")}
    except Exception as e:  # noqa: BLE001 - context is best effort
        extra["note"] = str(e)
    ctx.update(extra)
    return ctx


def t_list_courses(a):
    out = []
    for d in packtool.pack_dirs(PACKS):
        c = json.loads((d / "course.json").read_text("utf-8"))
        out.append({"id": c.get("id"), "title": c.get("title"), "description": c.get("description", ""),
                    "runtimes": c.get("runtimes", []), "weeks": len(c.get("weeks", [])), "lessons": len(c.get("lessons", []))})
    return out


def t_get_course(a):
    d = existing_pack(a["course"])
    c, lessons, drills, notebooks = packtool.load_pack(d)
    return {"course.json": c,
            "lessons": [{"id": l["id"], "title": l["title"], "week": l["week"], "track": l["track"], "file": l["file"],
                         "practice": len(l["practice"]), "recall": len(l["recall"])} for l in lessons],
            "drills": [{"id": x["id"], "title": x["title"], "lesson": x.get("lesson")} for x in drills],
            "notebooks": list(notebooks), "files": sorted(str(p.relative_to(d)) for p in d.rglob("*") if p.is_file())[:400]}


def t_get_lesson(a):
    f, txt = lesson_text(a["course"], a["lesson"])
    return "File: %s\n\n%s" % (f, txt)


def t_get_progress(a):
    return summarize_progress(a["course"])


def t_get_format_guide(a):
    return (ROOT / "docs" / "pack-format.md").read_text("utf-8")


def t_read_course_file(a):
    return safe_file(a["course"], a["path"]).read_text("utf-8")


def t_write_course_file(a):
    p = safe_file(a["course"], a["path"])
    if p.suffix == ".json":
        json.loads(a["content"])
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(a["content"], "utf-8")
    r = packtool.validate(existing_pack(a["course"]))
    return {"written": str(p.relative_to(PACKS)), "validation": r}


def t_create_course(a):
    d = pack_dir(a["id"])
    if d.exists():
        raise ValueError("course '%s' already exists" % a["id"])
    (d / "lessons").mkdir(parents=True)
    unit = a.get("unit") or "week"
    course = {"format": 1, "id": a["id"], "title": a["title"], "subtitle": a.get("subtitle", ""),
              "description": a.get("description", ""), "runtimes": a.get("runtimes") or [],
              "schedule": {"start": a.get("start") or "", "unit": unit},
              "labels": {"unit": unit.capitalize()}, "linkHosts": [], "tracks": {"core": "Core"},
              "phases": [{"id": "p1", "title": "Phase 1", "weeks": [1], "goal": ""}],
              "weeks": [{"n": 1, "title": "Getting started", "goal": "", "quizMax": 1,
                         "tasks": [{"id": "w1-intro", "track": "core", "core": True, "h": 1, "title": "First lesson",
                                    "desc": "", "lessons": ["intro"], "crit": [{"t": "L", "id": "intro"}]}], "quiz": []}],
              "exams": [], "lessons": ["lessons/01-intro.md"]}
    if not course["schedule"]["start"]:
        import datetime
        course["schedule"]["start"] = datetime.date.today().isoformat()
    (d / "course.json").write_text(json.dumps(course, indent=1, ensure_ascii=False) + "\n", "utf-8")
    (d / "lessons" / "01-intro.md").write_text(
        "=== intro | core | 1 | Introduction |\n@@ About 10 min reading\n## Why this matters\n\nReplace this text.\n\n"
        "--- practice\n@choice\nReplace this question.\n* right answer\n- wrong answer\n! Why the right answer is right.\n\n"
        "--- recall\nQ: Replace this question.\nA: Replace this answer.\n", "utf-8")
    packtool.write_index(PACKS)
    return {"created": str(d), "next": "Read get_format_guide, then write lessons and course.json with write_course_file. Run validate_course when done.",
            "validation": packtool.validate(d)}


def t_validate_course(a):
    r = packtool.validate(existing_pack(a["course"]))
    packtool.write_index(PACKS)
    return r


def t_run_python(a):
    course = a.get("course")
    if not course and (HOME / "context.json").is_file():
        course = (json.loads((HOME / "context.json").read_text("utf-8")).get("course") or {}).get("id")
    if not course:
        raise ValueError("say which course's data folder to run in")
    r = helper_call("/api/run", {"pack": course, "ns": a.get("namespace") or "tutor", "code": a["code"],
                                 "timeout": int(a.get("timeout") or 300)})
    text = (r.get("out") or "")
    if r.get("value") is not None:
        text += ("\n" if text else "") + "Out: " + r["value"]
    if r.get("error"):
        text += ("\n" if text else "") + r["error"]
    content = [{"type": "text", "text": text or "(no output)"}]
    for png in (r.get("imgs") or [])[:6]:
        content.append({"type": "image", "data": png, "mimeType": "image/png"})
    return {"__content__": content, "__error__": not r.get("ok")}


S = {"type": "string"}
TOOLS = [
    ("get_current_context", "Where the learner is right now in the Coursekit app: course, lesson (with its full Markdown), the exercise they asked about with their answer, notebook cells and errors, and progress. Includes a forTutorOnly block with the expected answer; use it to guide, not to hand over. Call this first when the learner asks for help.", {}, [], t_get_current_context),
    ("list_courses", "List the course packs installed in Coursekit.", {}, [], t_list_courses),
    ("get_course", "Overview of one course: its course.json, lessons, drills, notebooks and files.", {"course": S}, ["course"], t_get_course),
    ("get_lesson", "Full Markdown source of one lesson, including practice items, solutions and recall cards.", {"course": S, "lesson": S}, ["course", "lesson"], t_get_lesson),
    ("get_progress", "The learner's saved progress in a course: lessons learned, items that took several tries, drill boxes, checkpoint and quiz scores, study days.", {"course": S}, ["course"], t_get_progress),
    ("get_format_guide", "The course pack format: course.json fields, the lesson Markdown format, practice item types, drills, checkpoints and the ids-are-forever rule. Read it before creating or editing a course.", {}, [], t_get_format_guide),
    ("read_course_file", "Read a file of a course pack (path relative to the pack folder, e.g. course.json or lessons/01-intro.md).", {"course": S, "path": S}, ["course", "path"], t_read_course_file),
    ("write_course_file", "Create or replace a .md, .json, .csv or .txt file in a course pack, then validate the pack. Keep existing ids, practice items and recall cards in place; only append.", {"course": S, "path": S, "content": S}, ["course", "path", "content"], t_write_course_file),
    ("create_course", "Create a new empty course pack with a starter lesson. id: lower-case letters, digits and dashes. runtimes: [] for no code, [\"python\"] for runnable Python. unit: week, session, day…", {"id": S, "title": S, "subtitle": S, "description": S, "runtimes": {"type": "array", "items": S}, "unit": S, "start": S}, ["id", "title"], t_create_course),
    ("validate_course", "Check a course pack for broken references and malformed items, and refresh the app's course list.", {"course": S}, ["course"], t_validate_course),
    ("run_python", "Run Python on the learner's computer through the Coursekit helper (their libraries and GPU), in the course's data folder. Variables persist per namespace (default 'tutor'). Use it to check their code or demonstrate an idea.", {"code": S, "course": S, "namespace": S, "timeout": {"type": "integer"}}, ["code"], t_run_python),
]


PROMPTS = {
    "build-course": ("Build a new Coursekit course from a topic and, optionally, the learner's own materials.",
                     [{"name": "topic", "description": "What the course should teach", "required": True},
                      {"name": "details", "description": "Level, time per week, length, materials to use, goal", "required": False}],
                     "Build a Coursekit course on: {topic}\n\nDetails: {details}\n\n"
                     "1. Ask me anything you need first (my level, hours per week, how many weeks, my goal, which materials to use).\n"
                     "2. Call get_format_guide and read it fully.\n"
                     "3. Propose a plan: phases, weeks, lessons, drills, projects and checkpoints. Wait for my OK.\n"
                     "4. create_course, then write each lesson with write_course_file: deep explanations with worked examples, "
                     "5 to 7 practice items of mixed types, and 3 to 5 recall cards. Then drills.json and course.json with tasks, quizzes and checkpoints.\n"
                     "5. validate_course and fix every error. Tell me to open the app and pick the course."),
    "tutor": ("Help with whatever the learner is working on in Coursekit right now.", [],
              "Call get_current_context to see what I'm working on in Coursekit, then help me with it. "
              "Hints first; only give the full answer if I ask."),
}


# ---------- MCP over stdio (JSON-RPC 2.0, one message per line)

def reply(mid, result=None, error=None):
    msg = {"jsonrpc": "2.0", "id": mid}
    if error:
        msg["error"] = error
    else:
        msg["result"] = result
    sys.stdout.write(json.dumps(msg, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def handle(msg):
    m, mid = msg.get("method"), msg.get("id")
    if mid is None:
        return  # notification
    if m == "initialize":
        pv = (msg.get("params") or {}).get("protocolVersion") or "2025-06-18"
        return reply(mid, {"protocolVersion": pv, "capabilities": {"tools": {}, "prompts": {}},
                           "serverInfo": {"name": "coursekit", "version": VERSION}, "instructions": INSTRUCTIONS})
    if m == "ping":
        return reply(mid, {})
    if m == "prompts/list":
        return reply(mid, {"prompts": [{"name": n, "description": d, "arguments": a} for n, (d, a, _) in PROMPTS.items()]})
    if m == "prompts/get":
        params = msg.get("params") or {}
        p = PROMPTS.get(params.get("name"))
        if not p:
            return reply(mid, error={"code": -32602, "message": "unknown prompt"})
        args = dict({"topic": "", "details": "(none given)"}, **(params.get("arguments") or {}))
        return reply(mid, {"description": p[0], "messages": [{"role": "user", "content": {"type": "text", "text": p[2].format(**args)}}]})
    if m == "tools/list":
        return reply(mid, {"tools": [{"name": n, "description": d,
                                      "inputSchema": {"type": "object", "properties": p, "required": r}}
                                     for n, d, p, r, _ in TOOLS]})
    if m == "tools/call":
        params = msg.get("params") or {}
        fn = next((t[4] for t in TOOLS if t[0] == params.get("name")), None)
        if not fn:
            return reply(mid, error={"code": -32602, "message": "unknown tool %s" % params.get("name")})
        try:
            res = fn(params.get("arguments") or {})
            if isinstance(res, dict) and "__content__" in res:
                return reply(mid, {"content": res["__content__"], "isError": res["__error__"]})
            text = res if isinstance(res, str) else json.dumps(res, indent=1, ensure_ascii=False)
            return reply(mid, {"content": [{"type": "text", "text": text}], "isError": False})
        except Exception as e:  # noqa: BLE001 - tool errors go back to the model as text
            return reply(mid, {"content": [{"type": "text", "text": "Error: %s" % e}], "isError": True})
    return reply(mid, error={"code": -32601, "message": "method not found: %s" % m})


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except ValueError:
            reply(None, error={"code": -32700, "message": "parse error"})
            continue
        for one in (msg if isinstance(msg, list) else [msg]):
            handle(one)


if __name__ == "__main__":
    main()
