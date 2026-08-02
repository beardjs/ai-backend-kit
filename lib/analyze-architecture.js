'use strict';

const fs = require('fs');
const path = require('path');

const LAYER_DIRS = [
  'src/domain',
  'src/application',
  'src/infraestructure',
  'src/configuration',
];

const PATH_D_PROMPTS = [
  'Map this repository architecture as-is (Path D). Profile boundaries and mine recurring patterns.',
  'Run architecture discovery anyway (explicit override), even if the repo looks kit-layered.',
];

/**
 * Deterministic kit-layered alignment scan (same signals as Architecture Discovery).
 * Does not write profile.md / patterns.md — IDE agents own those artifacts.
 *
 * @param {string} targetDir Absolute path to the service repository root
 * @returns {{
 *   target: string,
 *   confidence: 'high' | 'medium' | 'low',
 *   aligned: boolean,
 *   signals: Array<{ id: string, label: string, present: boolean, evidence: string[] }>,
 *   recommendation: 'layered' | 'discover',
 *   nextSteps: string[],
 * }}
 */
function analyzeArchitecture(targetDir) {
  const target = path.resolve(targetDir);

  const foldersEvidence = LAYER_DIRS.filter((rel) => isDir(path.join(target, rel)));
  const foldersPresent = foldersEvidence.length === LAYER_DIRS.length;

  const canonEvidence = [];
  if (isFile(path.join(target, 'AGENTS.md'))) canonEvidence.push('AGENTS.md');
  if (isFile(path.join(target, 'docs', 'architecture-and-layers.md'))) {
    canonEvidence.push('docs/architecture-and-layers.md');
  }
  const canonPresent = canonEvidence.length > 0;

  const conventionEvidence = [];
  if (isDir(path.join(target, 'src', 'configuration', 'factory'))) {
    conventionEvidence.push('src/configuration/factory/');
  }
  if (isDir(path.join(target, 'src', 'application', 'controllers'))) {
    conventionEvidence.push('src/application/controllers/');
  }
  const repoFiles = findRepositoryContractFiles(path.join(target, 'src'));
  conventionEvidence.push(...repoFiles.slice(0, 5));
  const conventionsPresent =
    conventionEvidence.some((e) => e.includes('factory')) &&
    conventionEvidence.some((e) => e.includes('controllers')) &&
    repoFiles.length > 0;

  const kitEvidence = [];
  if (isDir(path.join(target, 'examples', 'canonical-user'))) {
    kitEvidence.push('examples/canonical-user/');
  }
  const ruleCandidates = [
    '.cursor/rules/rule.project-core.mdc',
    '.cursor/rules/rule.business-rules-layers.mdc',
    '.claude/rules/business-rules-layers.md',
  ];
  for (const rel of ruleCandidates) {
    if (isFile(path.join(target, rel))) kitEvidence.push(rel);
  }
  const kitPresent = kitEvidence.length > 0;

  const signals = [
    {
      id: 'folders',
      label: 'Layer folders (domain / application / infraestructure / configuration)',
      present: foldersPresent,
      evidence: foldersPresent ? LAYER_DIRS.slice() : foldersEvidence,
    },
    {
      id: 'canon',
      label: 'Documented canon (AGENTS.md and/or architecture-and-layers.md)',
      present: canonPresent,
      evidence: canonEvidence,
    },
    {
      id: 'conventions',
      label: 'Sample conventions (factories, controllers, I*RepositoryRead|Write files)',
      present: conventionsPresent,
      evidence: conventionEvidence,
    },
    {
      id: 'kit',
      label: 'Kit rules or canonical-user example',
      present: kitPresent,
      evidence: kitEvidence,
    },
  ];

  const presentCount = signals.filter((s) => s.present).length;
  let confidence;
  if (presentCount === signals.length) confidence = 'high';
  else if (presentCount >= 3) confidence = 'medium';
  else confidence = 'low';

  const aligned = confidence === 'high' || confidence === 'medium';
  const recommendation = aligned ? 'layered' : 'discover';

  const nextSteps = aligned
    ? [
        'Repo looks kit-layered — skip Architecture Discovery (SKIPPED_LAYERED_KIT).',
        'Use Spec-Driven delivery (agt-orchestrator / /orchestrate) or agt-architecture-review for layer audits.',
        'See AGENTS.md and docs/architecture-and-layers.md.',
      ]
    : [
        'Repo diverges from kit layered / canonical-user — run Architecture Discovery (Path D).',
        `Cursor: agt-orchestrator (discover-architecture) or agt-architecture-probe.`,
        `Claude Code: /architecture-discovery`,
        `Codex: architecture_discovery / $architecture-discovery`,
        `Prompt: ${PATH_D_PROMPTS[0]}`,
      ];

  return {
    target,
    confidence,
    aligned,
    signals,
    recommendation,
    nextSteps,
    prompts: PATH_D_PROMPTS.slice(),
  };
}

/**
 * Format a human-readable report for CLI / notes.
 * @param {ReturnType<typeof analyzeArchitecture>} report
 */
function formatArchitectureReport(report) {
  const lines = [
    `Architecture alignment scan — ${report.target}`,
    `Confidence: ${report.confidence} (${report.aligned ? 'aligned to kit layered' : 'diverged / unknown'})`,
    '',
    'Signals:',
  ];

  for (const signal of report.signals) {
    const mark = signal.present ? '✓' : '✗';
    lines.push(`  ${mark} ${signal.label}`);
    if (signal.evidence.length > 0) {
      lines.push(`      ${signal.evidence.join(', ')}`);
    } else if (!signal.present) {
      lines.push('      (none found)');
    }
  }

  lines.push('', 'Next steps:');
  for (const step of report.nextSteps) {
    lines.push(`  • ${step}`);
  }

  return lines.join('\n');
}

const KIT_VERSION_STAMPS = [
  '.cursor/KIT_VERSION',
  '.claude/KIT_VERSION',
  '.codex/KIT_VERSION',
];

/**
 * True when the target has never received a kit stamp (first install).
 * @param {string} targetDir
 */
function isFirstKitInstall(targetDir) {
  const target = path.resolve(targetDir);
  return !KIT_VERSION_STAMPS.some((rel) => isFile(path.join(target, rel)));
}

/**
 * Write deterministic CLI baseline under docs/architecture/alignment-scan.md.
 * @param {string} targetDir
 * @param {ReturnType<typeof analyzeArchitecture>} report
 * @param {{ dryRun?: boolean }} [opts]
 * @returns {string} absolute path that was (or would be) written
 */
function writeAlignmentScanMarkdown(targetDir, report, opts = {}) {
  const target = path.resolve(targetDir);
  const rel = path.join('docs', 'architecture', 'alignment-scan.md');
  const abs = path.join(target, rel);
  const generatedAt = new Date().toISOString();

  const body = [
    '# Architecture alignment scan (CLI)',
    '',
    '> Deterministic baseline from `ai-backend-kit` (no AI).',
    '> For a full narrative report, open the IDE and run `agt-architecture-analyst`',
    '> (after Path D probe + miner) to produce `docs/architecture/analysis.md`.',
    '',
    '## Metadata',
    '',
    '| Field | Value |',
    '|-------|-------|',
    `| Target | \`${report.target}\` |`,
    `| Generated at | ${generatedAt} |`,
    `| Confidence | ${report.confidence} |`,
    `| Aligned to kit layered | ${report.aligned ? 'yes' : 'no'} |`,
    `| Recommendation | ${report.recommendation} |`,
    '',
    '## Signals',
    '',
  ];

  for (const signal of report.signals) {
    body.push(`### ${signal.present ? 'Present' : 'Missing'} — ${signal.label}`);
    body.push('');
    if (signal.evidence.length > 0) {
      for (const item of signal.evidence) {
        body.push(`- \`${item}\``);
      }
    } else {
      body.push('- _(none found)_');
    }
    body.push('');
  }

  body.push('## Next steps', '');
  for (const step of report.nextSteps) {
    body.push(`- ${step}`);
  }
  body.push('');
  body.push('## Full analysis (IDE)', '');
  body.push(
    '1. Cursor: `agt-architecture-probe` → `agt-pattern-miner` → `agt-architecture-analyst`',
  );
  body.push('2. Claude Code: `/architecture-discovery` (includes analyst consolidation)');
  body.push('3. Codex: `architecture_discovery` / `$architecture-discovery`');
  body.push('');
  body.push('Output: `docs/architecture/analysis.md` (keeps `profile.md` + `patterns.md`).');
  body.push('');

  if (!opts.dryRun) {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, `${body.join('\n')}\n`);
  }

  return abs;
}

function isDir(abs) {
  try {
    return fs.statSync(abs).isDirectory();
  } catch {
    return false;
  }
}

function isFile(abs) {
  try {
    return fs.statSync(abs).isFile();
  } catch {
    return false;
  }
}

/**
 * Find files whose basename matches *repository.read* or *repository.write*
 * under src/ (bounded walk).
 * @param {string} srcRoot
 * @returns {string[]} paths relative to src parent (repo-relative when srcRoot ends with src)
 */
function findRepositoryContractFiles(srcRoot) {
  if (!isDir(srcRoot)) return [];
  const found = [];
  const maxFiles = 2000;
  let visited = 0;

  function walk(dir) {
    if (found.length >= 20 || visited >= maxFiles) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (found.length >= 20 || visited >= maxFiles) return;
      visited += 1;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
          continue;
        }
        walk(abs);
      } else if (entry.isFile()) {
        const name = entry.name.toLowerCase();
        if (
          name.includes('repository.read') ||
          name.includes('repository.write')
        ) {
          found.push(path.relative(path.dirname(srcRoot), abs).split(path.sep).join('/'));
        }
      }
    }
  }

  walk(srcRoot);
  return found;
}

module.exports = {
  analyzeArchitecture,
  formatArchitectureReport,
  isFirstKitInstall,
  writeAlignmentScanMarkdown,
  PATH_D_PROMPTS,
  LAYER_DIRS,
  KIT_VERSION_STAMPS,
};
