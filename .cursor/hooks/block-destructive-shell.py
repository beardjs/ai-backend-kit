#!/usr/bin/env python3
"""Block destructive / production-targeting shell commands from the agent."""
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


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"permission": "allow"}))
        return 0

    command = payload.get("command") or payload.get("cmd") or ""
    if not isinstance(command, str):
        command = ""

    for pattern in DENY_PATTERNS:
        if pattern.search(command):
            print(
                json.dumps(
                    {
                        "permission": "deny",
                        "user_message": "Blocked potentially destructive shell command.",
                        "agent_message": (
                            f"Hook blocked this command: {command!r}. "
                            "Use safer alternatives or ask the user to run it manually."
                        ),
                    }
                )
            )
            return 0

    print(json.dumps({"permission": "allow"}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
