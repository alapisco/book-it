#!/usr/bin/env python3
"""Validate data-testid / testID identifiers against docs/design/testids.md.

Usage:
  check_testids.py FILE...     check whole files
  check_testids.py --all       check every source file under web/ and app/
  check_testids.py --staged    check lines added in the git index (pre-commit)
  check_testids.py --hook      read a Claude Code PreToolUse payload on stdin

Exit 0 when clean. Exit 1 on violations (exit 2 in --hook mode, which makes
Claude Code block the write and show the message to the model).
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY = os.path.join(ROOT, "docs", "design", "testids.md")
SCOPED_DIRS = ("web/", "app/")
SOURCE_EXT = (".ts", ".tsx", ".js", ".jsx", ".html")
SKIP_DIRS = {"node_modules", "dist", "build", ".expo", "ios", "android"}

ID_FORMAT = re.compile(r"^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*){1,2}$")
# data-testid="x" | testID='x' | testID={"x"} | anything else inside {...}
ATTR = re.compile(
    r"""\b(data-testid|testID)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)')\s*\}|(\{))"""
)
REGISTRY_ROW = re.compile(r"^\|\s*`([^`]+)`\s*\|")


def load_registry():
    ids, in_screen = set(), False
    with open(REGISTRY, encoding="utf-8") as f:
        for line in f:
            if line.startswith("## "):
                in_screen = line.startswith("## Screen:")
                continue
            m = REGISTRY_ROW.match(line)
            if in_screen and m:
                ids.add(m.group(1))
    return ids


def in_scope(path):
    rel = os.path.relpath(os.path.abspath(path), ROOT).replace(os.sep, "/")
    if not rel.startswith(SCOPED_DIRS) or not rel.endswith(SOURCE_EXT):
        return None
    if SKIP_DIRS.intersection(rel.split("/")[1:-1]):
        return None
    return rel


def check_text(rel, text, registry, line_offset=0):
    problems = []
    for lineno, line in enumerate(text.splitlines(), 1):
        for m in ATTR.finditer(line):
            attr = m.group(1)
            value = next((g for g in m.groups()[1:5] if g is not None), None)
            where = f"{rel}:{lineno + line_offset}"
            if value is None:
                problems.append(f"{where}: {attr} value is not a string literal")
            elif not ID_FORMAT.match(value):
                problems.append(f"{where}: '{value}' does not match screen.element.qualifier")
            elif value not in registry:
                problems.append(f"{where}: '{value}' is not in docs/design/testids.md")
    return problems


def check_files(paths, registry):
    problems = []
    for p in paths:
        rel = in_scope(p)
        if rel and os.path.isfile(p):
            with open(p, encoding="utf-8") as f:
                problems += check_text(rel, f.read(), registry)
    return problems


def all_files():
    for top in SCOPED_DIRS:
        for dirpath, dirnames, filenames in os.walk(os.path.join(ROOT, top)):
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for name in filenames:
                yield os.path.join(dirpath, name)


def staged(registry):
    diff = subprocess.run(
        ["git", "diff", "--cached", "-U0", "--diff-filter=AM", "--", *SCOPED_DIRS],
        cwd=ROOT, capture_output=True, text=True, check=True,
    ).stdout
    problems, rel, lineno = [], None, 0
    for line in diff.splitlines():
        if line.startswith("+++ "):
            rel = in_scope(os.path.join(ROOT, line[6:])) if line.startswith("+++ b/") else None
        elif line.startswith("@@"):
            lineno = int(re.search(r"\+(\d+)", line).group(1))
        elif line.startswith("+") and rel:
            problems += check_text(rel, line[1:], registry, lineno - 1)
            lineno += 1
    return problems


def hook(registry):
    payload = json.load(sys.stdin)
    inp = payload.get("tool_input", {})
    rel = in_scope(inp.get("file_path", ""))
    if not rel:
        return []
    chunks = [inp.get("content", ""), inp.get("new_string", "")]
    chunks += [e.get("new_string", "") for e in inp.get("edits", [])]
    return check_text(rel, "\n".join(c for c in chunks if c), registry)


def main(argv):
    registry = load_registry()
    if argv == ["--hook"]:
        problems = hook(registry)
    elif argv == ["--staged"]:
        problems = staged(registry)
    elif argv == ["--all"]:
        problems = check_files(all_files(), registry)
    elif argv and not argv[0].startswith("--"):
        problems = check_files(argv, registry)
    else:
        print(__doc__, file=sys.stderr)
        return 64
    if not problems:
        return 0
    print("TESTID VALIDATION FAILED", file=sys.stderr)
    for p in problems:
        print(f"  {p}", file=sys.stderr)
    print("Register the identifier in docs/design/testids.md first (run /design <feature>),"
          " or use an identifier that is already registered.", file=sys.stderr)
    return 2 if argv == ["--hook"] else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
