#!/usr/bin/env bash
# Sync the backend kit into a target service repository.
# Usage: ./scripts/sync-cursor.sh /path/to/service [options]
#
# Options (any order):
#   --kit <names>          Kits to sync (comma-separated), e.g. --kit cursor,claude
#   --all                  Sync every kit directory present in the package
#   --dry-run              Print actions without writing
#   --no-delete            Do not delete files in target that are absent from the kit
#   --backup               Backup overwritten/deleted paths under <target>/.cursor-kit-backup-<timestamp>/
#   --force-specs-readme   Always overwrite docs/specs/README.md (default: copy only if missing)
#   --with-pr-template     Copy docs/templates/PULL_REQUEST_TEMPLATE.md if target lacks .github/PULL_REQUEST_TEMPLATE.md
#   -h, --help             Show this help
#
# Kits: cursor (.cursor), claude (.claude), codex (.codex). Default: cursor.
# Shared docs (AGENTS.md, architecture, specs templates, examples) are always synced.
# Missing kit directories in the package are skipped with a warning.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

DRY_RUN=0
NO_DELETE=0
BACKUP=0
FORCE_SPECS_README=0
WITH_PR_TEMPLATE=0
ALL_KITS=0
TARGET=""
KIT_ARGS=()

usage() {
  sed -n '2,18p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-1}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --no-delete) NO_DELETE=1 ;;
    --backup) BACKUP=1 ;;
    --force-specs-readme) FORCE_SPECS_README=1 ;;
    --with-pr-template) WITH_PR_TEMPLATE=1 ;;
    --all) ALL_KITS=1 ;;
    --kit)
      if [[ $# -lt 2 || "$2" == -* ]]; then
        echo "--kit requires a value (e.g. --kit cursor,claude)" >&2
        usage 1
      fi
      IFS=',' read -r -a _parts <<< "$2"
      for part in "${_parts[@]}"; do
        part="$(echo "$part" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
        [[ -n "$part" ]] && KIT_ARGS+=("$part")
      done
      shift
      ;;
    --kit=*)
      IFS=',' read -r -a _parts <<< "${1#--kit=}"
      for part in "${_parts[@]}"; do
        part="$(echo "$part" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
        [[ -n "$part" ]] && KIT_ARGS+=("$part")
      done
      ;;
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

kit_dir_for() {
  case "$1" in
    cursor) echo ".cursor" ;;
    claude) echo ".claude" ;;
    codex) echo ".codex" ;;
    *) return 1 ;;
  esac
}

resolve_requested_kits() {
  if [[ "$ALL_KITS" -eq 1 ]]; then
    if [[ ${#KIT_ARGS[@]} -gt 0 ]]; then
      echo "Use either --all or --kit, not both." >&2
      exit 1
    fi
    local found=()
    for name in cursor claude codex; do
      local dir
      dir="$(kit_dir_for "$name")"
      if [[ -d "$ROOT/$dir" ]]; then
        found+=("$name")
      fi
    done
    if [[ ${#found[@]} -eq 0 ]]; then
      echo "No kit directories found in the package (.cursor / .claude / .codex)." >&2
      exit 1
    fi
    printf '%s\n' "${found[@]}"
    return
  fi

  if [[ ${#KIT_ARGS[@]} -eq 0 ]]; then
    echo "cursor"
    return
  fi

  local seen=""
  local out=()
  for name in "${KIT_ARGS[@]}"; do
    if ! kit_dir_for "$name" >/dev/null; then
      echo "Unknown kit: $name. Valid kits: cursor, claude, codex" >&2
      exit 1
    fi
    if [[ " $seen " == *" $name "* ]]; then
      continue
    fi
    seen+=" $name"
    out+=("$name")
  done
  if [[ ${#out[@]} -eq 0 ]]; then
    echo "At least one kit is required. Valid kits: cursor, claude, codex" >&2
    exit 1
  fi
  printf '%s\n' "${out[@]}"
}

REQUESTED_KITS=()
while IFS= read -r _kit_line; do
  [[ -n "$_kit_line" ]] && REQUESTED_KITS+=("$_kit_line")
done < <(resolve_requested_kits)

PREVIOUS_CODEX_SKILLS=()
if [[ " ${REQUESTED_KITS[*]} " == *" codex "* && -f "$TARGET/.codex/skills-manifest.json" ]]; then
  while IFS= read -r _skill_line; do
    [[ "$_skill_line" =~ ^st-backend-[a-z0-9-]+$ ]] && PREVIOUS_CODEX_SKILLS+=("$_skill_line")
  done < <(node -e 'const fs=require("fs"); try { const m=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); for (const s of m.skills || []) console.log(s); } catch {}' "$TARGET/.codex/skills-manifest.json")
fi

RSYNC_FLAGS=(-a)
if [[ "$NO_DELETE" -eq 0 ]]; then
  RSYNC_FLAGS+=(--delete)
fi
# Preserve service-local overrides
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
echo "Kits:      $(IFS=,; echo "${REQUESTED_KITS[*]}")"
echo "Flags:     delete=$([[ "$NO_DELETE" -eq 0 ]] && echo yes || echo no) backup=$([[ "$BACKUP" -eq 1 ]] && echo yes || echo no)"

SYNCED_KITS=()
STAMP_PATHS=()

for name in "${REQUESTED_KITS[@]}"; do
  dir="$(kit_dir_for "$name")"
  if [[ ! -d "$ROOT/$dir" ]]; then
    echo "⚠ Skipping $name: $dir/ is not present in the kit package yet." >&2
    continue
  fi

  if [[ -n "$BACKUP_DIR" && -d "$TARGET/$dir" ]]; then
    echo "→ Backing up existing $dir/ (excluding local/)"
    mkdir -p "$BACKUP_DIR/$dir"
    rsync -a --exclude 'local/' "$TARGET/$dir/" "$BACKUP_DIR/$dir/"
  fi

  echo "→ Syncing $dir/"
  KIT_RSYNC_FLAGS=("${RSYNC_FLAGS[@]}")
  if [[ "$name" == "claude" ]]; then
    # Consumer-owned Claude Code files survive the sync (parity with lib/sync-kit.js KIT_PRESERVE)
    KIT_RSYNC_FLAGS+=(
      --exclude 'settings.local.json'
      --exclude 'CLAUDE.local.md'
      --exclude 'agent-memory/'
      --exclude 'agent-memory-local/'
    )
  fi
  rsync "${KIT_RSYNC_FLAGS[@]}" "$ROOT/$dir/" "$TARGET/$dir/"

  echo "→ Stamping $dir/KIT_VERSION ($KIT_VERSION)"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "Would write $dir/KIT_VERSION"
  else
    printf '%s\n' "$KIT_VERSION" > "$TARGET/$dir/KIT_VERSION"
  fi
  SYNCED_KITS+=("$name")
  STAMP_PATHS+=("$dir/KIT_VERSION")
done

if [[ ${#SYNCED_KITS[@]} -eq 0 ]]; then
  echo "None of the requested kits exist in the package: ${REQUESTED_KITS[*]}" >&2
  exit 1
fi

if [[ " ${SYNCED_KITS[*]} " == *" codex "* ]]; then
  echo "→ Syncing Codex repository skills (.agents/skills/)"
  CODEX_SKILLS=()
  while IFS= read -r _skill_line; do
    [[ "$_skill_line" =~ ^st-backend-[a-z0-9-]+$ ]] && CODEX_SKILLS+=("$_skill_line")
  done < <(node -e 'const fs=require("fs"); const m=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); for (const s of m.skills || []) console.log(s);' "$ROOT/.codex/skills-manifest.json")

  [[ ${#CODEX_SKILLS[@]} -gt 0 ]] || { echo "Codex skills manifest is empty." >&2; exit 1; }
  for skill in "${CODEX_SKILLS[@]}"; do
    [[ -f "$ROOT/.agents/skills/$skill/SKILL.md" ]] || { echo "Missing Codex skill: $skill" >&2; exit 1; }
    if [[ "$DRY_RUN" -eq 1 ]]; then
      echo "Would sync .agents/skills/$skill/"
      continue
    fi
    if [[ -n "$BACKUP_DIR" && -d "$TARGET/.agents/skills/$skill" ]]; then
      mkdir -p "$BACKUP_DIR/.agents/skills/$skill"
      rsync -a "$TARGET/.agents/skills/$skill/" "$BACKUP_DIR/.agents/skills/$skill/"
    fi
    mkdir -p "$TARGET/.agents/skills/$skill"
    rsync "${RSYNC_FLAGS[@]}" "$ROOT/.agents/skills/$skill/" "$TARGET/.agents/skills/$skill/"
  done

  if [[ "$NO_DELETE" -eq 0 ]]; then
    if [[ ${#PREVIOUS_CODEX_SKILLS[@]} -gt 0 ]]; then
      for stale in "${PREVIOUS_CODEX_SKILLS[@]}"; do
        if [[ " ${CODEX_SKILLS[*]} " == *" $stale "* || ! -d "$TARGET/.agents/skills/$stale" ]]; then
          continue
        fi
        if [[ "$DRY_RUN" -eq 1 ]]; then
          echo "Would delete stale managed Codex skill .agents/skills/$stale"
        else
          backup_if_exists ".agents/skills/$stale"
          rm -rf -- "$TARGET/.agents/skills/$stale"
        fi
      done
    fi
  fi
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
echo "Synced kits: ${SYNCED_KITS[*]}"
echo "Kit version stamped: $KIT_VERSION (see ${STAMP_PATHS[*]})."
echo "See docs/ADOPTION.md for the checklist."
