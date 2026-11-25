#!/usr/bin/env python3
"""Coursekit pack tool (Python twin of tools/pack.js, used by the helper and the MCP server).

    python3 helper/packtool.py validate [packs/<id> ...]
    python3 helper/packtool.py index

The lesson parser mirrors app/js/text.js; tests/check.sh compares the two.
Standard library only.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PACKS = ROOT / "packs"
TYPES = ("predict", "answer", "choice", "run", "local", "write")


def parse_lessons(txt):
    out, cur, mode, item = [], None, "body", None
    lines = txt.replace("\r", "").split("\n")
    i = 0

    def push():
        nonlocal item
        if item is not None and cur is not None:
            cur["practice"].append(item)
        item = None

    while i < len(lines):
        ln = lines[i]
        if ln.startswith("=== "):
            push()
            p = [s.strip() for s in ln[4:].split("|")]
            while len(p) < 5:
                p.append("")
            try:
                week = int(p[2])
            except ValueError:
                week = 0
            cur = {"id": p[0], "track": p[1], "week": week, "title": p[3],
                   "drills": [s.strip() for s in p[4].split(",") if s.strip()],
                   "sub": "", "body": [], "practice": [], "recall": []}
            out.append(cur)
            mode = "body"
            i += 1
            continue
        if cur is None:
            i += 1
            continue
        if ln.startswith("@@ ") and mode == "body" and not cur["body"]:
            cur["sub"] = ln[3:]
            i += 1
            continue
        if ln.strip() == "--- practice":
            mode = "practice"
            i += 1
            continue
        if ln.strip() == "--- recall":
            push()
            mode = "recall"
            i += 1
            continue
        if mode == "body":
            cur["body"].append(ln)
            i += 1
            continue
        if mode == "recall":
            if ln.startswith("Q: "):
                cur["recall"].append({"q": ln[3:], "a": ""})
            elif ln.startswith("A: ") and cur["recall"]:
                cur["recall"][-1]["a"] = ln[3:]
            elif ln.strip() and cur["recall"]:
                cur["recall"][-1]["a"] += "\n" + ln
            i += 1
            continue
        m = re.match(r"^@(predict|answer|choice|run|local|write)\s*$", ln)
        if m:
            push()
            item = {"type": m.group(1), "prompt": [], "expect": [], "alts": [], "opts": [], "why": "", "min": 0}
            i += 1
            continue
        if item is None:
            i += 1
            continue
        f = re.match(r"^```(\w*)\s*$", ln)
        if f:
            kind, buf = f.group(1), []
            i += 1
            while i < len(lines) and not re.match(r"^```\s*$", lines[i]):
                buf.append(lines[i])
                i += 1
            i += 1
            code = "\n".join(buf)
            if kind in ("starter", "test", "solution"):
                item[kind] = code
            else:
                item["prompt"].append("```" + kind + "\n" + code + "\n```")
            continue
        if ln.startswith("=| "):
            item["alts"].append(ln[3:])
        elif ln.startswith("= ") or ln == "=":
            item["expect"].append(ln[2:])
        elif ln.startswith("! "):
            item["why"] += (" " if item["why"] else "") + ln[2:]
        elif re.match(r"^min: ?\d+", ln):
            item["min"] = int(re.sub(r"\D", "", ln))
        elif item["type"] == "choice" and re.match(r"^[-*] ", ln):
            item["opts"].append({"t": ln[2:], "ok": ln[0] == "*"})
        else:
            item["prompt"].append(ln)
        i += 1
    push()
    for l in out:
        l["body"] = "\n".join(l["body"])
        for p in l["practice"]:
            p["prompt"] = "\n".join(p["prompt"]).strip()
    return out


def load_pack(d):
    d = Path(d)
    c = json.loads((d / "course.json").read_text("utf-8"))
    lessons = []
    for f in c.get("lessons", []):
        for l in parse_lessons((d / f).read_text("utf-8")):
            l["file"] = f
            lessons.append(l)
    drills = json.loads((d / c["drills"]).read_text("utf-8")) if c.get("drills") else []
    notebooks = json.loads((d / c["notebooks"]).read_text("utf-8")) if c.get("notebooks") else {}
    return c, lessons, drills, notebooks


def validate(d):
    d = Path(d)
    errs, warn = [], []
    try:
        c, lessons, drills, notebooks = load_pack(d)
    except Exception as e:  # noqa: BLE001 - report any load failure as a validation error
        return {"errors": ["cannot load: %s" % e], "warnings": [], "stats": None}
    for k in ("id", "title", "lessons"):
        if not c.get(k):
            errs.append("course.json: missing " + k)
    if c.get("id") and c["id"] != d.name:
        errs.append("course.json id '%s' must match the folder name '%s'" % (c["id"], d.name))
    rt = c.get("runtimes") or []
    LB, DB = {}, {}
    for l in lessons:
        if l["id"] in LB:
            errs.append("duplicate lesson id " + l["id"])
        LB[l["id"]] = l
    for dr in drills:
        if dr["id"] in DB:
            errs.append("duplicate drill id " + dr["id"])
        DB[dr["id"]] = dr
    tracks = c.get("tracks") or {}
    for l in lessons:
        w = "%s (%s)" % (l["file"], l["id"])
        if not l["title"]:
            errs.append(w + ": no title")
        if tracks and l["track"] not in tracks:
            warn.append(w + ": track '%s' is not in course.tracks" % l["track"])
        if not l["practice"]:
            warn.append(w + ": no practice items")
        for x in l["drills"]:
            if x not in DB:
                errs.append(w + ": drill %s not found" % x)
        for k, p in enumerate(l["practice"]):
            ww = "%s practice #%d (@%s)" % (w, k, p["type"])
            if p["type"] in ("run", "local") and "python" not in rt:
                errs.append(ww + ": needs the python runtime")
            if p["type"] == "choice" and sum(1 for o in p["opts"] if o["ok"]) != 1:
                errs.append(ww + ": needs exactly one option marked *")
            if p["type"] in ("predict", "answer") and not p["expect"]:
                errs.append(ww + ": no expected answer (= line)")
            if p["type"] == "run" and (not p.get("test") or not p["expect"]):
                errs.append(ww + ": needs a test block and expected output")
            if p["type"] == "write" and not p["min"]:
                warn.append(ww + ": no min word count")
        if not l["recall"]:
            warn.append(w + ": no recall cards")
    for dr in drills:
        if dr.get("lesson") not in LB:
            errs.append("drill %s: lesson %s not found" % (dr["id"], dr.get("lesson")))
        if dr.get("tests") and "python" not in rt:
            errs.append("drill %s: tests need the python runtime" % dr["id"])
        if not dr.get("solution"):
            errs.append("drill %s: no solution" % dr["id"])
    exams = c.get("exams") or []
    tids = set()
    for i, w in enumerate(c.get("weeks") or []):
        if w.get("n") != i + 1:
            errs.append("weeks[%d].n should be %d" % (i, i + 1))
        for t in w.get("tasks") or []:
            if t["id"] in tids:
                errs.append("duplicate task id " + t["id"])
            tids.add(t["id"])
            for x in t.get("lessons") or []:
                if x not in LB:
                    errs.append("task %s: lesson %s not found" % (t["id"], x))
            for j, k in enumerate(t.get("crit") or []):
                ww = "task %s crit #%d" % (t["id"], j)
                if k.get("t") not in ("L", "D", "QZ", "X", "DAYS", "U", "T", "N", "C"):
                    errs.append(ww + ": unknown type %s" % k.get("t"))
                if k.get("t") == "L" and k.get("id") not in LB:
                    errs.append(ww + ": lesson %s not found" % k.get("id"))
                if k.get("t") == "D" and k.get("id") not in DB:
                    errs.append(ww + ": drill %s not found" % k.get("id"))
                if k.get("t") == "X" and not any(e["id"] == k.get("id") for e in exams):
                    errs.append(ww + ": checkpoint %s not found" % k.get("id"))
        for j, q in enumerate(w.get("quiz") or []):
            if not (0 <= q.get("a", -1) < len(q.get("o", []))):
                errs.append("week %s quiz #%d: answer index out of range" % (w.get("n"), j))
    for p in c.get("phases") or []:
        for n in p.get("weeks", []):
            if not (1 <= n <= len(c.get("weeks") or [])):
                errs.append("phase %s: week %s not found" % (p.get("id"), n))
    for e in exams:
        for x in e.get("lessons", []):
            if x not in LB:
                errs.append("checkpoint %s: lesson %s not found" % (e["id"], x))
        for ref in e.get("items", []):
            if ref.startswith("D:"):
                if ref[2:] not in DB:
                    errs.append("checkpoint %s: drill %s not found" % (e["id"], ref))
                continue
            lid, _, k = ref.partition("#")
            l = LB.get(lid)
            if not l or not k.isdigit() or int(k) >= len(l["practice"]):
                errs.append("checkpoint %s: item %s not found" % (e["id"], ref))
    for nid in notebooks:
        if nid not in tids:
            warn.append("notebook %s has no task with the same id" % nid)
    for f in c.get("data") or []:
        if not (d / "data" / f).exists():
            errs.append("data file %s missing from data/" % f)
    stats = {"lessons": len(lessons), "practice": sum(len(l["practice"]) for l in lessons),
             "recall": sum(len(l["recall"]) for l in lessons), "drills": len(drills),
             "weeks": len(c.get("weeks") or []), "checkpoints": len(exams), "notebooks": len(notebooks)}
    return {"errors": errs, "warnings": warn, "stats": stats}


def pack_dirs(root=PACKS):
    return sorted(p for p in Path(root).iterdir() if (p / "course.json").is_file())


def write_index(root=PACKS):
    packs = []
    for d in pack_dirs(root):
        c = json.loads((d / "course.json").read_text("utf-8"))
        packs.append({"id": c.get("id", d.name), "title": c.get("title", d.name),
                      "subtitle": c.get("subtitle", ""), "description": c.get("description", "")})
    (Path(root) / "index.json").write_text(json.dumps({"packs": packs}, indent=1, ensure_ascii=False) + "\n", "utf-8")
    return packs


def main(argv):
    if argv[:1] == ["validate"]:
        bad = 0
        for d in [Path(a).resolve() for a in argv[1:]] or pack_dirs():
            r = validate(d)
            print(("FAIL " if r["errors"] else "ok   ") + d.name + ("  " + json.dumps(r["stats"]) if r["stats"] else ""))
            for e in r["errors"]:
                print("  error: " + e)
            if r["warnings"]:
                print("  %d warnings" % len(r["warnings"]))
            bad += bool(r["errors"])
        return 1 if bad else 0
    if argv[:1] == ["index"]:
        print("packs/index.json: " + ", ".join(p["id"] for p in write_index()))
        return 0
    if argv[:1] == ["parse"] and len(argv) == 2:  # used by tests: dump parsed lessons as JSON
        print(json.dumps(load_pack(Path(argv[1]).resolve())[1], ensure_ascii=False, sort_keys=True))
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
