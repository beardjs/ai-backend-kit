#!/usr/bin/env python3
"""Block destructive / production-targeting shell commands (Claude Code PreToolUse hook)."""
from __future__ import annotations

import json
import re
import sys

DENY_PATTERNS = [
    re.compile(r"\brm\s+(-[^\s]*\s+)*-r[^\s]*f\b|\brm\s+(-[^\s]*\s+)*-fr\b", re.I),
    re.compile(r"\bgit\s+push\s+[^\n]*--force\b|\bgit\s+push\s+[^\n]*\s+-f\b", re.I),
    re.compile(r"\bgit\s+reset\s+--hard\b", re.I),
    re.compile(r"\bkubectl\b[^\n]*(?:\s|--context[=\s]+)production\b", re.I),
    re.compile(r"\bkubectl\b[^\n]*\s-n\s+prod(?:uction)?\b", re.I),
    re.compile(r"\bdrop\s+database\b|\bdrop\s+schema\b", re.I),
    re.compile(r"\bmkfs\b|\bdd\s+if=", re.I),
]


def deny(reason: str) -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            }
        )
    )


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        # Fail-open on malformed input, matching the cursor kit hook.
        return 0

    tool_input = payload.get("tool_input")
    command = tool_input.get("command") if isinstance(tool_input, dict) else None
    if not isinstance(command, str):
        command = ""

    for pattern in DENY_PATTERNS:
        if pattern.search(command):
            deny(
                f"Blocked potentially destructive shell command: {command!r}. "
                "Use safer alternatives or ask the user to run it manually."
            )
            return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
