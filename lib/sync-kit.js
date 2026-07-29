'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Sync the Cursor kit payload into a target service directory.
 * Parity with scripts/sync-cursor.sh (Node, no rsync).
 *
 * @param {object} options
 * @param {string} options.kitRoot Absolute path to the kit package root
 * @param {string} options.target Absolute path to the service root
 * @param {boolean} [options.dryRun]
 * @param {boolean} [options.noDelete]
 * @param {boolean} [options.backup]
 * @param {boolean} [options.forceSpecsReadme]
 * @param {boolean} [options.withPrTemplate]
 * @param {(msg: string) => void} [options.log]
 */
function syncKit(options) {
  const log = options.log || console.log;
  const kitRoot = path.resolve(options.kitRoot);
  const target = path.resolve(options.target);
  const dryRun = Boolean(options.dryRun);
  const noDelete = Boolean(options.noDelete);
  const doBackup = Boolean(options.backup);
  const forceSpecsReadme = Boolean(options.forceSpecsReadme);
  const withPrTemplate = Boolean(options.withPrTemplate);

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
  log(`Flags:     delete=${noDelete ? 'no' : 'yes'} backup=${doBackup ? 'yes' : 'no'}`);

  if (dryRun) {
    log('Dry-run mode — no files will be written.');
  }

  const cursorSrc = path.join(kitRoot, '.cursor');
  const cursorDest = path.join(target, '.cursor');
  if (backupDir && fs.existsSync(cursorDest)) {
    log('→ Backing up existing .cursor/ (excluding local/)');
    copyTree(cursorDest, path.join(backupDir, '.cursor'), {
      excludeTopLevel: new Set(['local']),
      dryRun: false,
      log: () => {},
    });
  }

  log('→ Syncing .cursor/');
  syncTree(cursorSrc, cursorDest, {
    ...ctx,
    excludeTopLevel: new Set(['local']),
    preserveTopLevel: new Set(['local']),
  });

  log(`→ Stamping .cursor/KIT_VERSION (${kitVersion})`);
  writeFile(path.join(target, '.cursor', 'KIT_VERSION'), `${kitVersion}\n`, ctx, '.cursor/KIT_VERSION');

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

  log('Done. Feature specs under docs/specs/<slug>/ were left untouched.');
  log(`Kit version stamped: ${kitVersion} (see .cursor/KIT_VERSION).`);
  log('See docs/ADOPTION.md for the checklist.');

  return { kitVersion, target, kitRoot };
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    noDelete: false,
    backup: false,
    forceSpecsReadme: false,
    withPrTemplate: false,
    target: null,
    help: false,
  };

  for (const arg of argv) {
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
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
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

  return options;
}

function usage() {
  return `Usage: st-cursor-backend [target-dir] [options]

Sync the Cursor backend kit into a service repository.
Default target: current working directory.

Options (any order):
  --dry-run              Print actions without writing
  --no-delete            Do not delete files in target that are absent from the kit
  --backup               Backup overwritten paths under <target>/.cursor-kit-backup-<timestamp>/
  --force-specs-readme   Always overwrite docs/specs/README.md (default: copy only if missing)
  --with-pr-template     Seed .github/PULL_REQUEST_TEMPLATE.md if missing
  -h, --help             Show this help
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
    // Never delete KIT_VERSION here — stamped after .cursor sync
    if (rel === 'KIT_VERSION') continue;
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
  syncKit,
  parseArgs,
  usage,
};
