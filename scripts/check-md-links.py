#!/usr/bin/env python3
"""Fail if relative markdown links in this kit point to missing files."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIR_NAMES = {".git", "node_modules"}

LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")


def iter_markdown_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIR_NAMES for part in path.parts):
            continue
        if path.suffix.lower() in {".md", ".mdc"}:
            files.append(path)
    return files


def normalize_target(link: str) -> tuple[str, bool] | None:
    """Return (path, is_mdc) or None if the link should be skipped."""
    link = link.strip()
    if not link or link.startswith("#"):
        return None
    is_mdc = link.startswith("mdc:")
    if is_mdc:
        link = link[len("mdc:") :]
        if link.startswith("/"):
            link = link[1:]
    elif re.match(r"^[a-z][a-z0-9+.-]*:", link, re.I):
        return None
    if " " in link:
        link = link.split(" ", 1)[0]
    link = link.split("#", 1)[0]
    if not link:
        return None
    return link, is_mdc


def resolve_link(md: Path, target: str, is_mdc: bool) -> Path:
    if is_mdc:
        return (ROOT / target).resolve()
    candidate = (md.parent / target).resolve()
    if candidate.exists():
        return candidate
    # Fallback for root-relative pedagogical paths
    root_candidate = (ROOT / target).resolve()
    if root_candidate.exists():
        return root_candidate
    return candidate


def main() -> int:
    errors: list[str] = []
    for md in iter_markdown_files():
        text = md.read_text(encoding="utf-8")
        for match in LINK_RE.finditer(text):
            raw = match.group(2)
            normalized = normalize_target(raw)
            if normalized is None:
                continue
            target, is_mdc = normalized
            resolved = resolve_link(md, target, is_mdc)
            if not resolved.exists():
                errors.append(f"{md.relative_to(ROOT)}: broken link -> {raw}")

    if errors:
        print(f"Found {len(errors)} broken relative markdown link(s):", file=sys.stderr)
        for err in errors:
            print(f"  {err}", file=sys.stderr)
        return 1

    print("All relative markdown links resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
