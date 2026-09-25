#!/usr/bin/env bash
# PreToolUse hook: blocks Write/Edit/MultiEdit to web/ or app/ that would
# introduce an unregistered identifier. Exit 2 = block and tell the model.
exec python3 "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}/scripts/check_testids.py" --hook
