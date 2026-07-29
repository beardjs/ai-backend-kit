#!/usr/bin/env python3
"""Block agent reads of sensitive credential files."""
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


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"permission": "allow"}))
        return 0

    # Cursor may send different shapes; accept common keys.
    candidates = [
        payload.get("file_path"),
        payload.get("path"),
        payload.get("filePath"),
        (payload.get("file") or {}).get("path") if isinstance(payload.get("file"), dict) else None,
    ]
    path = next((c for c in candidates if isinstance(c, str) and c), "")

    if path and is_sensitive(path):
        print(
            json.dumps(
                {
                    "permission": "deny",
                    "user_message": f"Blocked read of sensitive file: {path}",
                    "agent_message": (
                        "Do not read .env or credential files. Use named env constants "
                        "from src/configuration and ask the user for non-secret guidance."
                    ),
                }
            )
        )
        return 0

    print(json.dumps({"permission": "allow"}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
