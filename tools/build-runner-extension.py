#!/usr/bin/env python3
"""Packs the Coursekit runner as a Claude desktop extension (.mcpb): a zip of manifest.json,
the server and its language table. Usage: python3 tools/build-runner-extension.py [out file]"""
import sys, zipfile
from pathlib import Path
root = Path(__file__).resolve().parent.parent / "runner"
out = Path(sys.argv[1] if len(sys.argv) > 1 else "coursekit-runner.mcpb")
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for name in ("manifest.json", "coursekit-runner.js", "langs.json"):
        z.write(root / name, name)
print("wrote", out, out.stat().st_size, "bytes")
