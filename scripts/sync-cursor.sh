#!/usr/bin/env bash
# Sync the Cursor backend kit into a target service repository.
# Usage: ./scripts/sync-cursor.sh /path/to/service [options]
#
# Options (any order):
#   --dry-run              Print actions without writing
#   --no-delete            Do not delete files in target that are absent from the kit
#   --backup               Backup overwritten/deleted paths under <target>/.cursor-kit-backup-<timestamp>/
#   --force-specs-readme   Always overwrite docs/specs/README.md (default: copy only if missing)
#   --with-pr-template     Copy docs/templates/PULL_REQUEST_TEMPLATE.md if target lacks .github/PULL_REQUEST_TEMPLATE.md
#   -h, --help             Show this help

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DRY_RUN=0
NO_DELETE=0
BACKUP=0
FORCE_SPECS_README=0
WITH_PR_TEMPLATE=0
TARGET=""

usage() {
  sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-1}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --no-delete) NO_DELETE=1 ;;
    --backup) BACKUP=1 ;;
    --force-specs-readme) FORCE_SPECS_README=1 ;;
    --with-pr-template) WITH_PR_TEMPLATE=1 ;;
    -h|--help) usage 0 ;;
    -*)
      echo "Unknown option: $1" >&2
      usage 1
      ;;
    *)
      if [[ -n "$TARGET" ]]; then
        echo "Unexpected argument: $1" >&2
        usage 1
      fi
      TARGET="$1"
      ;;
  esac
  shift
done

[[ -n "$TARGET" ]] || usage 1
[[ -d "$TARGET" ]] || { echo "Target directory does not exist: $TARGET" >&2; exit 1; }

# Prefer absolute path
TARGET="$(cd "$TARGET" && pwd)"

if [[ ! -d "$TARGET/.git" && ! -f "$TARGET/package.json" ]]; then
  echo "Target does not look like a service repo (missing .git/ and package.json): $TARGET" >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required but was not found in PATH." >&2
  exit 1
fi

KIT_VERSION="$(tr -d '[:space:]' < "$ROOT/VERSION")"
[[ -n "$KIT_VERSION" ]] || { echo "VERSION file is empty or missing at $ROOT/VERSION" >&2; exit 1; }

RSYNC_FLAGS=(-a)
if [[ "$NO_DELETE" -eq 0 ]]; then
  RSYNC_FLAGS+=(--delete)
fi
# Preserve service-local Cursor overrides
RSYNC_FLAGS+=(--exclude 'local/')

if [[ "$DRY_RUN" -eq 1 ]]; then
  RSYNC_FLAGS+=(--dry-run --verbose)
  echo "Dry-run mode — no files will be written."
fi

BACKUP_DIR=""
if [[ "$BACKUP" -eq 1 && "$DRY_RUN" -eq 0 ]]; then
  BACKUP_DIR="$TARGET/.cursor-kit-backup-$(date +%Y%m%d%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  echo "Backup directory: $BACKUP_DIR"
fi

backup_if_exists() {
  local rel="$1"
  if [[ -n "$BACKUP_DIR" && -e "$TARGET/$rel" ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$rel")"
    cp -a "$TARGET/$rel" "$BACKUP_DIR/$rel"
  fi
}

copy_file() {
  local src="$1"
  local dest_rel="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "Would copy $dest_rel"
    return
  fi
  backup_if_exists "$dest_rel"
  mkdir -p "$(dirname "$TARGET/$dest_rel")"
  cp "$src" "$TARGET/$dest_rel"
}

echo "Kit root:  $ROOT"
echo "Target:    $TARGET"
echo "Version:   $KIT_VERSION"
echo "Flags:     delete=$([[ "$NO_DELETE" -eq 0 ]] && echo yes || echo no) backup=$([[ "$BACKUP" -eq 1 ]] && echo yes || echo no)"

if [[ -n "$BACKUP_DIR" && -d "$TARGET/.cursor" ]]; then
  echo "→ Backing up existing .cursor/ (excluding local/)"
  mkdir -p "$BACKUP_DIR/.cursor"
  rsync -a --exclude 'local/' "$TARGET/.cursor/" "$BACKUP_DIR/.cursor/"
fi

echo "→ Syncing .cursor/"
rsync "${RSYNC_FLAGS[@]}" "$ROOT/.cursor/" "$TARGET/.cursor/"

echo "→ Stamping .cursor/KIT_VERSION ($KIT_VERSION)"
if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Would write .cursor/KIT_VERSION"
else
  printf '%s\n' "$KIT_VERSION" > "$TARGET/.cursor/KIT_VERSION"
fi

echo "→ Syncing AGENTS.md"
copy_file "$ROOT/AGENTS.md" "AGENTS.md"

echo "→ Syncing docs/architecture-and-layers.md"
copy_file "$ROOT/docs/architecture-and-layers.md" "docs/architecture-and-layers.md"

echo "→ Syncing docs/specs/_templates/"
mkdir -p "$TARGET/docs/specs"
if [[ -n "$BACKUP_DIR" && -d "$TARGET/docs/specs/_templates" && "$DRY_RUN" -eq 0 ]]; then
  mkdir -p "$BACKUP_DIR/docs/specs"
  rsync -a "$TARGET/docs/specs/_templates/" "$BACKUP_DIR/docs/specs/_templates/"
fi
rsync "${RSYNC_FLAGS[@]}" "$ROOT/docs/specs/_templates/" "$TARGET/docs/specs/_templates/"

if [[ "$FORCE_SPECS_README" -eq 1 || ! -f "$TARGET/docs/specs/README.md" ]]; then
  echo "→ Syncing docs/specs/README.md"
  copy_file "$ROOT/docs/specs/README.md" "docs/specs/README.md"
else
  echo "→ Keeping existing docs/specs/README.md (use --force-specs-readme to overwrite)"
fi

echo "→ Syncing examples/canonical-user/"
mkdir -p "$TARGET/examples"
if [[ -n "$BACKUP_DIR" && -d "$TARGET/examples/canonical-user" && "$DRY_RUN" -eq 0 ]]; then
  mkdir -p "$BACKUP_DIR/examples"
  rsync -a "$TARGET/examples/canonical-user/" "$BACKUP_DIR/examples/canonical-user/"
fi
rsync "${RSYNC_FLAGS[@]}" "$ROOT/examples/canonical-user/" "$TARGET/examples/canonical-user/"

if [[ "$WITH_PR_TEMPLATE" -eq 1 ]]; then
  if [[ -f "$TARGET/.github/PULL_REQUEST_TEMPLATE.md" ]]; then
    echo "→ Keeping existing .github/PULL_REQUEST_TEMPLATE.md"
  else
    echo "→ Seeding .github/PULL_REQUEST_TEMPLATE.md"
    copy_file "$ROOT/docs/templates/PULL_REQUEST_TEMPLATE.md" ".github/PULL_REQUEST_TEMPLATE.md"
  fi
fi

echo "Done. Feature specs under docs/specs/<slug>/ were left untouched."
echo "Kit version stamped: $KIT_VERSION (see .cursor/KIT_VERSION)."
echo "See docs/ADOPTION.md for the checklist."
