#!/usr/bin/env python3
"""Block agent access to sensitive credential files (Claude Code PreToolUse hook)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

SENSITIVE_NAMES = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.staging",
    "credentials.json",
    "service-account.json",
}
SENSITIVE_SUFFIXES = (".pem", ".p12", ".key")


def is_sensitive(path: str) -> bool:
    name = Path(path).name
    if name in SENSITIVE_NAMES or name.startswith(".env."):
        return True
    lower = name.lower()
    return any(lower.endswith(suf) for suf in SENSITIVE_SUFFIXES)


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
    path = tool_input.get("file_path") if isinstance(tool_input, dict) else None
    if not isinstance(path, str):
        path = ""

    if path and is_sensitive(path):
        deny(
            f"Blocked access to sensitive file: {path}. Do not read or edit .env or "
            "credential files. Use named env constants from src/configuration and "
            "ask the user for non-secret guidance."
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
