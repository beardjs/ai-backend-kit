'use strict';

const { describe, it } = require('node:test');
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

function scaffoldLayerFolders(target) {
  for (const rel of [
    'src/domain',
    'src/application',
    'src/infraestructure',
    'src/configuration',
  ]) {
    mkdirp(path.join(target, rel));
  }
}

function scaffoldConventions(target, repoFile = 'user.repository.read.ts') {
  mkdirp(path.join(target, 'src/configuration/factory'));
  mkdirp(path.join(target, 'src/application/controllers'));
  write(
    path.join(target, 'src/domain/user/repository', repoFile),
    'export {}\n',
  );
}

describe('when analyzing an empty target', () => {
  it('should report low confidence and recommend discover', (t) => {
    const target = tempDir('ai-backend-kit-analyze-empty-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));

    const report = analyzeArchitecture(target);

    assert.equal(report.confidence, 'low');
    assert.equal(report.aligned, false);
    assert.equal(report.recommendation, 'discover');
    assert.equal(report.signals.every((s) => s.present === false), true);
    assert.match(formatArchitectureReport(report), /Confidence: low/);
  });
});

describe('when analyzing a target with all four signals present', () => {
  it('should report high confidence and recommend layered', (t) => {
    const target = tempDir('ai-backend-kit-analyze-full-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));

    scaffoldLayerFolders(target);
    scaffoldConventions(target);
    mkdirp(path.join(target, 'examples/canonical-user'));
    write(path.join(target, 'AGENTS.md'), '# agents\n');
    write(
      path.join(target, 'docs', 'architecture-and-layers.md'),
      '# layers\n',
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
});

describe('when analyzing a target with exactly three signals present', () => {
  it('should report medium confidence and remain aligned', (t) => {
    const target = tempDir('ai-backend-kit-analyze-medium-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));

    scaffoldLayerFolders(target);
    scaffoldConventions(target, 'user.repository.write.ts');
    write(path.join(target, 'AGENTS.md'), '# agents\n');
    // No kit rules / canonical-user → 3 of 4 signals

    const report = analyzeArchitecture(target);

    assert.equal(report.confidence, 'medium');
    assert.equal(report.aligned, true);
    assert.equal(report.recommendation, 'layered');
    assert.equal(report.signals.filter((s) => s.present).length, 3);
  });
});

describe('when analyzing a target with exactly two signals present', () => {
  it('should report low confidence and recommend discover', (t) => {
    const target = tempDir('ai-backend-kit-analyze-two-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));

    scaffoldLayerFolders(target);
    write(path.join(target, 'AGENTS.md'), '# agents\n');
    // folders + canon only → 2 of 4 (just below medium threshold)

    const report = analyzeArchitecture(target);

    assert.equal(report.confidence, 'low');
    assert.equal(report.aligned, false);
    assert.equal(report.recommendation, 'discover');
    assert.equal(report.signals.filter((s) => s.present).length, 2);
  });
});

describe('when parsing analyze-architecture CLI flags', () => {
  it('should set analyzeArchitecture to true for --analyze-architecture', () => {
    assert.equal(parseCliArgs(['-y', '--analyze-architecture']).analyzeArchitecture, true);
  });

  it('should set analyzeArchitecture to false for --no-analyze-architecture', () => {
    assert.equal(parseCliArgs(['-y', '--no-analyze-architecture']).analyzeArchitecture, false);
  });

  it('should leave analyzeArchitecture as null when neither flag is passed', () => {
    assert.equal(parseCliArgs(['-y']).analyzeArchitecture, null);
  });

  it('should reject when both analyze flags are passed together', () => {
    assert.throws(
      () => parseCliArgs(['--analyze-architecture', '--no-analyze-architecture']),
      /either --analyze-architecture or --no-analyze-architecture/,
    );
  });
});

describe('when checking whether the target is a first kit install', () => {
  it('should return true when no KIT_VERSION stamp exists', (t) => {
    const target = tempDir('ai-backend-kit-analyze-first-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));
    assert.equal(isFirstKitInstall(target), true);
  });

  it('should return false after a KIT_VERSION stamp is written', (t) => {
    const target = tempDir('ai-backend-kit-analyze-stamped-');
    t.after(() => fs.rmSync(target, { recursive: true, force: true }));
    write(path.join(target, '.cursor', 'KIT_VERSION'), '1.0.0\n');
    assert.equal(isFirstKitInstall(target), false);
  });
});

describe('when writing the alignment scan markdown', () => {
  it('should create docs/architecture/alignment-scan.md with analyst pointers', (t) => {
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
});
