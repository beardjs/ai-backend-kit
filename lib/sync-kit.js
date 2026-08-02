'use strict';

const fs = require('fs');
const path = require('path');

/** @type {Readonly<Record<string, string>>} */
const KIT_DIRS = Object.freeze({
  cursor: '.cursor',
  claude: '.claude',
  codex: '.codex',
});

const KIT_NAMES = Object.freeze(Object.keys(KIT_DIRS));
const DEFAULT_KITS = Object.freeze(['cursor']);
const CODEX_SKILLS_DIR = path.join('.agents', 'skills');
const CODEX_SKILLS_MANIFEST = path.join('.codex', 'skills-manifest.json');

/**
 * Per-kit destination paths that must survive orphan deletion because the
 * consumer's tooling writes them inside the kit directory.
 */
const KIT_PRESERVE = Object.freeze({
  claude: Object.freeze({
    topLevel: Object.freeze(['agent-memory', 'agent-memory-local']),
    files: Object.freeze(['settings.local.json', 'CLAUDE.local.md']),
  }),
});

/**
 * Sync the backend kit payload into a target service directory.
 * Parity with scripts/sync-cursor.sh (Node, no rsync).
 *
 * @param {object} options
 * @param {string} options.kitRoot Absolute path to the kit package root
 * @param {string} options.target Absolute path to the service root
 * @param {string[]} [options.kits] Kit names to sync (cursor / claude / codex)
 * @param {boolean} [options.dryRun]
 * @param {boolean} [options.noDelete]
 * @param {boolean} [options.backup]
 * @param {boolean} [options.forceSpecsReadme]
 * @param {boolean} [options.withPrTemplate]
 * @param {(msg: string) => void} [options.log]
 * @param {(msg: string) => void} [options.warn]
 */
function syncKit(options) {
  const log = options.log || console.log;
  const warn = options.warn || console.warn;
  const kitRoot = path.resolve(options.kitRoot);
  const target = path.resolve(options.target);
  const dryRun = Boolean(options.dryRun);
  const noDelete = Boolean(options.noDelete);
  const doBackup = Boolean(options.backup);
  const forceSpecsReadme = Boolean(options.forceSpecsReadme);
  const withPrTemplate = Boolean(options.withPrTemplate);
  const requestedKits = normalizeKitList(options.kits || DEFAULT_KITS);

  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    throw new Error(`Target directory does not exist: ${target}`);
  }

  const hasGit = fs.existsSync(path.join(target, '.git'));
  const hasPkg = fs.existsSync(path.join(target, 'package.json'));
  if (!hasGit && !hasPkg) {
    throw new Error(
      `Target does not look like a service repo (missing .git/ and package.json): ${target}`,
    );
  }

  const versionPath = path.join(kitRoot, 'VERSION');
  if (!fs.existsSync(versionPath)) {
    throw new Error(`VERSION file is empty or missing at ${versionPath}`);
  }
  const kitVersion = fs.readFileSync(versionPath, 'utf8').trim();
  if (!kitVersion) {
    throw new Error(`VERSION file is empty or missing at ${versionPath}`);
  }

  let backupDir = null;
  if (doBackup && !dryRun) {
    const stamp = new Date()
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14);
    backupDir = path.join(target, `.cursor-kit-backup-${stamp}`);
    fs.mkdirSync(backupDir, { recursive: true });
    log(`Backup directory: ${backupDir}`);
  }

  const ctx = { kitRoot, target, dryRun, noDelete, backupDir, log };

  log(`Kit root:  ${kitRoot}`);
  log(`Target:    ${target}`);
  log(`Version:   ${kitVersion}`);
  log(`Kits:      ${requestedKits.join(', ')}`);
  log(`Flags:     delete=${noDelete ? 'no' : 'yes'} backup=${doBackup ? 'yes' : 'no'}`);

  if (dryRun) {
    log('Dry-run mode — no files will be written.');
  }

  const previousCodexSkills = requestedKits.includes('codex')
    ? readCodexSkillManifest(path.join(target, CODEX_SKILLS_MANIFEST))
    : [];
  const syncedKits = [];
  for (const name of requestedKits) {
    const dirName = KIT_DIRS[name];
    const src = path.join(kitRoot, dirName);
    if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
      warn(`⚠ Skipping ${name}: ${dirName}/ is not present in the kit package yet.`);
      continue;
    }

    const dest = path.join(target, dirName);
    if (backupDir && fs.existsSync(dest)) {
      log(`→ Backing up existing ${dirName}/ (excluding local/)`);
      copyTree(dest, path.join(backupDir, dirName), {
        excludeTopLevel: new Set(['local']),
        dryRun: false,
        log: () => {},
      });
    }

    log(`→ Syncing ${dirName}/`);
    const preserve = KIT_PRESERVE[name] || {};
    syncTree(src, dest, {
      ...ctx,
      excludeTopLevel: new Set(['local']),
      preserveTopLevel: new Set(['local', ...(preserve.topLevel || [])]),
      preserveFiles: new Set(preserve.files || []),
    });

    const stampRel = path.join(dirName, 'KIT_VERSION');
    log(`→ Stamping ${stampRel} (${kitVersion})`);
    writeFile(path.join(dest, 'KIT_VERSION'), `${kitVersion}\n`, ctx, stampRel);
    syncedKits.push(name);
  }

  if (syncedKits.includes('codex')) {
    syncCodexSkills({ ...ctx, previousSkills: previousCodexSkills });
  }

  if (syncedKits.length === 0) {
    throw new Error(
      `None of the requested kits exist in the package: ${requestedKits.join(', ')}. ` +
        `Available: ${listAvailableKits(kitRoot).join(', ') || '(none)'}`,
    );
  }

  log('→ Syncing AGENTS.md');
  copyFileRel(path.join(kitRoot, 'AGENTS.md'), 'AGENTS.md', ctx);

  log('→ Syncing docs/architecture-and-layers.md');
  copyFileRel(
    path.join(kitRoot, 'docs', 'architecture-and-layers.md'),
    path.join('docs', 'architecture-and-layers.md'),
    ctx,
  );

  log('→ Syncing docs/specs/_templates/');
  const templatesSrc = path.join(kitRoot, 'docs', 'specs', '_templates');
  const templatesDest = path.join(target, 'docs', 'specs', '_templates');
  if (backupDir && fs.existsSync(templatesDest) && !dryRun) {
    copyTree(templatesDest, path.join(backupDir, 'docs', 'specs', '_templates'), {
      dryRun: false,
      log: () => {},
    });
  }
  ensureDir(path.join(target, 'docs', 'specs'), dryRun);
  syncTree(templatesSrc, templatesDest, ctx);

  const specsReadmeRel = path.join('docs', 'specs', 'README.md');
  const specsReadmeDest = path.join(target, specsReadmeRel);
  if (forceSpecsReadme || !fs.existsSync(specsReadmeDest)) {
    log('→ Syncing docs/specs/README.md');
    copyFileRel(path.join(kitRoot, 'docs', 'specs', 'README.md'), specsReadmeRel, ctx);
  } else {
    log('→ Keeping existing docs/specs/README.md (use --force-specs-readme to overwrite)');
  }

  log('→ Syncing examples/canonical-user/');
  const examplesSrc = path.join(kitRoot, 'examples', 'canonical-user');
  const examplesDest = path.join(target, 'examples', 'canonical-user');
  if (backupDir && fs.existsSync(examplesDest) && !dryRun) {
    copyTree(examplesDest, path.join(backupDir, 'examples', 'canonical-user'), {
      dryRun: false,
      log: () => {},
    });
  }
  ensureDir(path.join(target, 'examples'), dryRun);
  syncTree(examplesSrc, examplesDest, ctx);

  if (withPrTemplate) {
    const prRel = path.join('.github', 'PULL_REQUEST_TEMPLATE.md');
    const prDest = path.join(target, prRel);
    if (fs.existsSync(prDest)) {
      log('→ Keeping existing .github/PULL_REQUEST_TEMPLATE.md');
    } else {
      log('→ Seeding .github/PULL_REQUEST_TEMPLATE.md');
      copyFileRel(
        path.join(kitRoot, 'docs', 'templates', 'PULL_REQUEST_TEMPLATE.md'),
        prRel,
        ctx,
      );
    }
  }

  const stampPaths = syncedKits.map((name) => `${KIT_DIRS[name]}/KIT_VERSION`).join(', ');
  log('Done. Feature specs under docs/specs/<slug>/ were left untouched.');
  log(`Synced kits: ${syncedKits.join(', ')}`);
  log(`Kit version stamped: ${kitVersion} (see ${stampPaths}).`);
  log('See docs/ADOPTION.md for the checklist.');

  return { kitVersion, target, kitRoot, kits: syncedKits };
}

function readCodexSkillManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!parsed || !Array.isArray(parsed.skills)) return [];
    return parsed.skills.filter(isSafeSkillName);
  } catch {
    return [];
  }
}

function isSafeSkillName(name) {
  return typeof name === 'string' && /^ai-backend-kit-[a-z0-9-]+$/.test(name);
}

function syncCodexSkills(ctx) {
  const srcRoot = path.join(ctx.kitRoot, CODEX_SKILLS_DIR);
  const destRoot = path.join(ctx.target, CODEX_SKILLS_DIR);
  const manifestPath = path.join(ctx.kitRoot, CODEX_SKILLS_MANIFEST);
  const currentSkills = readCodexSkillManifest(manifestPath);

  if (!fs.existsSync(srcRoot) || currentSkills.length === 0) {
    throw new Error('Codex kit is missing its managed .agents/skills payload or manifest.');
  }

  ctx.log('→ Syncing Codex repository skills (.agents/skills/)');
  for (const skillName of currentSkills) {
    const src = path.join(srcRoot, skillName);
    if (!fs.existsSync(path.join(src, 'SKILL.md'))) {
      throw new Error(`Codex skill is missing SKILL.md: ${skillName}`);
    }
    syncTree(src, path.join(destRoot, skillName), ctx);
  }

  if (ctx.noDelete) return;
  const currentSet = new Set(currentSkills);
  for (const staleName of ctx.previousSkills || []) {
    if (currentSet.has(staleName) || !isSafeSkillName(staleName)) continue;
    const stalePath = path.join(destRoot, staleName);
    if (!fs.existsSync(stalePath)) continue;
    const staleRel = path.relative(ctx.target, stalePath);
    if (ctx.dryRun) {
      ctx.log(`Would delete stale managed Codex skill ${staleRel}`);
      continue;
    }
    backupIfExists(staleRel, ctx);
    fs.rmSync(stalePath, { recursive: true, force: false });
  }
}

/**
 * @param {string} kitRoot
 * @returns {string[]}
 */
function listAvailableKits(kitRoot) {
  return KIT_NAMES.filter((name) => {
    const dir = path.join(kitRoot, KIT_DIRS[name]);
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  });
}

/**
 * Resolve which kits to sync from CLI flags.
 * When `all` is true, returns kits present in the package.
 * When `kits` is empty/null and not `all`, returns DEFAULT_KITS (caller may still prompt).
 *
 * @param {{ kits?: string[] | null, all?: boolean, kitRoot: string }} opts
 * @returns {string[]}
 */
function resolveKits({ kits, all, kitRoot }) {
  if (all) {
    const available = listAvailableKits(kitRoot);
    if (available.length === 0) {
      throw new Error('No kit directories found in the package (.cursor / .claude / .codex).');
    }
    return available;
  }
  if (kits && kits.length > 0) {
    return normalizeKitList(kits);
  }
  return [...DEFAULT_KITS];
}

/**
 * @param {string[]} kits
 * @returns {string[]}
 */
function normalizeKitList(kits) {
  const seen = new Set();
  const result = [];
  for (const raw of kits) {
    const name = String(raw).trim().toLowerCase();
    if (!name) continue;
    if (!KIT_DIRS[name]) {
      throw new Error(`Unknown kit: ${raw}. Valid kits: ${KIT_NAMES.join(', ')}`);
    }
    if (seen.has(name)) continue;
    seen.add(name);
    result.push(name);
  }
  if (result.length === 0) {
    throw new Error(`At least one kit is required. Valid kits: ${KIT_NAMES.join(', ')}`);
  }
  return result;
}

/**
 * @param {string} value Comma-separated kit names
 * @returns {string[]}
 */
function parseKitValue(value) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    noDelete: false,
    backup: false,
    forceSpecsReadme: false,
    withPrTemplate: false,
    yes: false,
    interactive: false,
    all: false,
    kits: null,
    target: null,
    help: false,
    analyzeArchitecture: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--no-delete':
        options.noDelete = true;
        break;
      case '--backup':
        options.backup = true;
        break;
      case '--force-specs-readme':
        options.forceSpecsReadme = true;
        break;
      case '--with-pr-template':
        options.withPrTemplate = true;
        break;
      case '--analyze-architecture':
        options.analyzeArchitecture = true;
        break;
      case '--no-analyze-architecture':
        options.analyzeArchitecture = false;
        break;
      case '-y':
      case '--yes':
        options.yes = true;
        break;
      case '-i':
      case '--interactive':
        options.interactive = true;
        break;
      case '--all':
        options.all = true;
        break;
      case '--kit': {
        const next = argv[i + 1];
        if (!next || next.startsWith('-')) {
          throw new Error('--kit requires a value (e.g. --kit cursor,claude)');
        }
        i += 1;
        const parsed = parseKitValue(next);
        options.kits = options.kits ? options.kits.concat(parsed) : parsed;
        break;
      }
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
        if (arg.startsWith('--kit=')) {
          const parsed = parseKitValue(arg.slice('--kit='.length));
          options.kits = options.kits ? options.kits.concat(parsed) : parsed;
          break;
        }
        if (arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        }
        if (options.target) {
          throw new Error(`Unexpected argument: ${arg}`);
        }
        options.target = arg;
        break;
    }
  }

  if (options.kits) {
    options.kits = normalizeKitList(options.kits);
  }

  if (options.all && options.kits) {
    throw new Error('Use either --all or --kit, not both.');
  }

  if (options.interactive && (options.yes || options.all || options.kits)) {
    throw new Error('Use either --interactive or non-interactive flags (--kit / --all / -y), not both.');
  }

  const hasAnalyze = argv.includes('--analyze-architecture');
  const hasNoAnalyze = argv.includes('--no-analyze-architecture');
  if (hasAnalyze && hasNoAnalyze) {
    throw new Error('Use either --analyze-architecture or --no-analyze-architecture, not both.');
  }

  return options;
}

function usage() {
  return `Usage: ai-backend-kit [target-dir] [options]

Sync the backend kit into a service repository.
Default target: current working directory.

By default in a terminal (npx with no flags), opens an interactive panel to pick kits
and common options. Shared docs (AGENTS.md, architecture, specs templates, examples)
are always synced.

Kits: ${KIT_NAMES.join(', ')}  (default non-interactive: ${DEFAULT_KITS.join(', ')})

Options (any order):
  -i, --interactive      Force the interactive panel
  --kit <names>          Kits to sync (comma-separated or repeatable), e.g. --kit cursor,claude
  --all                  Sync every kit directory present in the package
  -y, --yes              Skip interactive panel; use default kit (cursor)
  --dry-run              Print actions without writing
  --no-delete            Do not delete files in target that are absent from the kit
  --backup               Backup overwritten paths under <target>/.cursor-kit-backup-<timestamp>/
  --force-specs-readme   Always overwrite docs/specs/README.md (default: copy only if missing)
  --with-pr-template     Seed .github/PULL_REQUEST_TEMPLATE.md if missing
  --analyze-architecture Run a local kit-layered alignment scan after sync (no AI)
  --no-analyze-architecture  Skip the post-sync architecture scan / prompt
  -h, --help             Show this help

Developed by Filipe Paixão · https://github.com/FilipePaixao
`;
}

function ensureDir(dir, dryRun) {
  if (dryRun) return;
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(absPath, content, ctx, relForLog) {
  if (ctx.dryRun) {
    ctx.log(`Would write ${relForLog || absPath}`);
    return;
  }
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content);
}

function backupIfExists(rel, ctx) {
  if (!ctx.backupDir) return;
  const abs = path.join(ctx.target, rel);
  if (!fs.existsSync(abs)) return;
  const dest = path.join(ctx.backupDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(abs, dest, { recursive: true });
}

function copyFileRel(srcAbs, destRel, ctx) {
  if (ctx.dryRun) {
    ctx.log(`Would copy ${destRel}`);
    return;
  }
  backupIfExists(destRel, ctx);
  const destAbs = path.join(ctx.target, destRel);
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  fs.copyFileSync(srcAbs, destAbs);
}

function listFiles(root, { excludeTopLevel = new Set() } = {}) {
  const files = [];
  if (!fs.existsSync(root)) return files;

  function walk(dir, relParts) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (relParts.length === 0 && excludeTopLevel.has(entry.name)) {
        continue;
      }
      const nextRel = [...relParts, entry.name];
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs, nextRel);
      } else if (entry.isFile() || entry.isSymbolicLink()) {
        files.push(nextRel.join(path.sep));
      }
    }
  }

  walk(root, []);
  return files;
}

function syncTree(srcRoot, destRoot, ctx) {
  const excludeTopLevel = ctx.excludeTopLevel || new Set();
  const preserveTopLevel = ctx.preserveTopLevel || new Set();
  const preserveFiles = ctx.preserveFiles || new Set();
  const srcFiles = new Set(listFiles(srcRoot, { excludeTopLevel }));

  for (const rel of srcFiles) {
    const src = path.join(srcRoot, rel);
    const dest = path.join(destRoot, rel);
    if (ctx.dryRun) {
      ctx.log(`Would copy ${path.relative(ctx.target, dest) || rel}`);
      continue;
    }
    const destRelFromTarget = path.relative(ctx.target, dest);
    if (ctx.backupDir && fs.existsSync(dest)) {
      backupIfExists(destRelFromTarget, ctx);
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }

  if (ctx.noDelete || !fs.existsSync(destRoot)) {
    return;
  }

  const destFiles = listFiles(destRoot, { excludeTopLevel: preserveTopLevel });
  for (const rel of destFiles) {
    const top = rel.split(path.sep)[0];
    if (preserveTopLevel.has(top)) continue;
    if (srcFiles.has(rel)) continue;
    // Never delete KIT_VERSION here — stamped after kit sync
    if (rel === 'KIT_VERSION') continue;
    // Consumer-owned files (e.g. .claude/settings.local.json) survive the sync
    if (preserveFiles.has(rel)) continue;
    const dest = path.join(destRoot, rel);
    if (ctx.dryRun) {
      ctx.log(`Would delete ${path.relative(ctx.target, dest)}`);
      continue;
    }
    const destRelFromTarget = path.relative(ctx.target, dest);
    backupIfExists(destRelFromTarget, ctx);
    fs.unlinkSync(dest);
    pruneEmptyDirs(path.dirname(dest), destRoot, preserveTopLevel);
  }
}

function pruneEmptyDirs(dir, stopAt, preserveTopLevel) {
  let current = dir;
  while (current.startsWith(stopAt) && current !== stopAt) {
    const base = path.basename(current);
    if (preserveTopLevel && preserveTopLevel.has(base) && path.dirname(current) === stopAt) {
      break;
    }
    try {
      const entries = fs.readdirSync(current);
      if (entries.length > 0) break;
      fs.rmdirSync(current);
    } catch {
      break;
    }
    current = path.dirname(current);
  }
}

function copyTree(srcRoot, destRoot, { excludeTopLevel = new Set(), dryRun = false, log = console.log } = {}) {
  const files = listFiles(srcRoot, { excludeTopLevel });
  for (const rel of files) {
    const src = path.join(srcRoot, rel);
    const dest = path.join(destRoot, rel);
    if (dryRun) {
      log(`Would copy ${dest}`);
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

module.exports = {
  KIT_DIRS,
  KIT_NAMES,
  DEFAULT_KITS,
  CODEX_SKILLS_DIR,
  CODEX_SKILLS_MANIFEST,
  syncKit,
  parseArgs,
  usage,
  listAvailableKits,
  resolveKits,
  normalizeKitList,
};
