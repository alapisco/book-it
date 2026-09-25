#!/usr/bin/env python3
"""PreToolUse hook for role subagents: block Write/Edit outside owned paths.

Usage (from agent frontmatter): enforce_ownership.py PATH [PATH...]
A PATH ending in "/" is a directory prefix; otherwise an exact file.
Exit 2 blocks the tool call and shows the message to the model.
"""
import json
import os
import sys

root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
allowed = sys.argv[1:]
target = json.load(sys.stdin).get("tool_input", {}).get("file_path", "")
rel = os.path.relpath(os.path.abspath(os.path.join(root, target)), root).replace(os.sep, "/")

if any(rel.startswith(a) if a.endswith("/") else rel == a for a in allowed):
    sys.exit(0)

print(
    f"OWNERSHIP VIOLATION: this role may only write to {', '.join(allowed)}; "
    f"refused write to '{rel}'. Stop and report what change is needed there "
    "so the owning role (or the user) can make it.",
    file=sys.stderr,
)
sys.exit(2)
