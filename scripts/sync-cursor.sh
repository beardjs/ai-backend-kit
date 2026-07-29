#!/usr/bin/env bash
# Sync the Cursor backend kit into a target service repository.
# Usage: ./scripts/sync-cursor.sh /path/to/service [--dry-run]

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-}"
DRY_RUN="${2:-}"

usage() {
  echo "Usage: $0 /path/to/target-service [--dry-run]"
  exit 1
}

[[ -n "$TARGET" ]] || usage
[[ -d "$TARGET" ]] || { echo "Target directory does not exist: $TARGET"; exit 1; }

RSYNC_FLAGS=(-a --delete)
if [[ "$DRY_RUN" == "--dry-run" ]]; then
  RSYNC_FLAGS+=(--dry-run --verbose)
  echo "Dry-run mode — no files will be written."
fi

echo "Kit root:  $ROOT"
echo "Target:    $TARGET"

echo "→ Syncing .cursor/"
rsync "${RSYNC_FLAGS[@]}" "$ROOT/.cursor/" "$TARGET/.cursor/"

echo "→ Syncing AGENTS.md"
if [[ "$DRY_RUN" == "--dry-run" ]]; then
  echo "Would copy AGENTS.md"
else
  cp "$ROOT/AGENTS.md" "$TARGET/AGENTS.md"
fi

echo "→ Syncing docs/architecture-and-layers.md"
mkdir -p "$TARGET/docs"
if [[ "$DRY_RUN" == "--dry-run" ]]; then
  echo "Would copy docs/architecture-and-layers.md"
else
  cp "$ROOT/docs/architecture-and-layers.md" "$TARGET/docs/architecture-and-layers.md"
fi

echo "→ Syncing docs/specs/_templates/ and docs/specs/README.md"
mkdir -p "$TARGET/docs/specs"
rsync "${RSYNC_FLAGS[@]}" "$ROOT/docs/specs/_templates/" "$TARGET/docs/specs/_templates/"
if [[ "$DRY_RUN" == "--dry-run" ]]; then
  echo "Would copy docs/specs/README.md"
else
  cp "$ROOT/docs/specs/README.md" "$TARGET/docs/specs/README.md"
fi

echo "Done. Feature specs under docs/specs/<slug>/ were left untouched."
echo "See docs/ADOPTION.md for the checklist."
