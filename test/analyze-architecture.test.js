'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  analyzeArchitecture,
  formatArchitectureReport,
  isFirstKitInstall,
  writeAlignmentScanMarkdown,
} = require('../lib/analyze-architecture');
const { parseArgs: parseCliArgs } = require('../lib/sync-kit');

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, content = '') {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

test('empty target is low confidence / discover', (t) => {
  const target = tempDir('ai-backend-kit-analyze-empty-');
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  const report = analyzeArchitecture(target);

  assert.equal(report.confidence, 'low');
  assert.equal(report.aligned, false);
  assert.equal(report.recommendation, 'discover');
  assert.equal(report.signals.every((s) => s.present === false), true);
  assert.match(formatArchitectureReport(report), /Confidence: low/);
});

test('full kit-layered shape is high confidence / layered', (t) => {
  const target = tempDir('ai-backend-kit-analyze-full-');
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  for (const rel of [
    'src/domain',
    'src/application',
    'src/infraestructure',
    'src/configuration',
    'src/configuration/factory',
    'src/application/controllers',
    'examples/canonical-user',
  ]) {
    mkdirp(path.join(target, rel));
  }
  write(path.join(target, 'AGENTS.md'), '# agents\n');
  write(
    path.join(target, 'docs', 'architecture-and-layers.md'),
    '# layers\n',
  );
  write(
    path.join(
      target,
      'src/domain/user/repository/user.repository.read.ts',
    ),
    'export {}\n',
  );
  write(
    path.join(target, '.cursor/rules/rule.project-core.mdc'),
    '# core\n',
  );

  const report = analyzeArchitecture(target);

  assert.equal(report.confidence, 'high');
  assert.equal(report.aligned, true);
  assert.equal(report.recommendation, 'layered');
  assert.equal(report.signals.filter((s) => s.present).length, 4);
});

test('majority of signals yields medium confidence', (t) => {
  const target = tempDir('ai-backend-kit-analyze-medium-');
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  for (const rel of [
    'src/domain',
    'src/application',
    'src/infraestructure',
    'src/configuration',
    'src/configuration/factory',
    'src/application/controllers',
  ]) {
    mkdirp(path.join(target, rel));
  }
  write(path.join(target, 'AGENTS.md'), '# agents\n');
  write(
    path.join(
      target,
      'src/domain/user/repository/user.repository.write.ts',
    ),
    'export {}\n',
  );
  // No kit rules / canonical-user → 3 of 4 signals

  const report = analyzeArchitecture(target);

  assert.equal(report.confidence, 'medium');
  assert.equal(report.aligned, true);
  assert.equal(report.recommendation, 'layered');
});

test('parseArgs accepts analyze architecture flags', () => {
  assert.equal(parseCliArgs(['-y', '--analyze-architecture']).analyzeArchitecture, true);
  assert.equal(parseCliArgs(['-y', '--no-analyze-architecture']).analyzeArchitecture, false);
  assert.equal(parseCliArgs(['-y']).analyzeArchitecture, null);
  assert.throws(
    () => parseCliArgs(['--analyze-architecture', '--no-analyze-architecture']),
    /either --analyze-architecture or --no-analyze-architecture/,
  );
});

test('isFirstKitInstall is true without KIT_VERSION stamps', (t) => {
  const target = tempDir('ai-backend-kit-analyze-first-');
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  assert.equal(isFirstKitInstall(target), true);
  write(path.join(target, '.cursor', 'KIT_VERSION'), '1.0.0\n');
  assert.equal(isFirstKitInstall(target), false);
});

test('writeAlignmentScanMarkdown writes docs/architecture/alignment-scan.md', (t) => {
  const target = tempDir('ai-backend-kit-analyze-write-');
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  const report = analyzeArchitecture(target);
  const abs = writeAlignmentScanMarkdown(target, report);
  assert.equal(fs.existsSync(abs), true);
  const text = fs.readFileSync(abs, 'utf8');
  assert.match(text, /Architecture alignment scan \(CLI\)/);
  assert.match(text, /agt-architecture-analyst/);
  assert.match(text, /analysis\.md/);
});
