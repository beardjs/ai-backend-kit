'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { syncKit } = require('../lib/sync-kit');

const kitRoot = path.resolve(__dirname, '..');

function fixture() {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), 'st-backend-kit-'));
  fs.mkdirSync(path.join(target, '.git'));
  fs.writeFileSync(path.join(target, 'package.json'), '{"name":"fixture"}\n');
  return target;
}

function run(target, kits, overrides = {}) {
  return syncKit({
    kitRoot,
    target,
    kits,
    log: () => {},
    warn: () => {},
    ...overrides,
  });
}

test('codex selection installs native config and managed repository skills only', (t) => {
  const target = fixture();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  fs.mkdirSync(path.join(target, '.agents', 'skills', 'service-local'), { recursive: true });
  fs.writeFileSync(path.join(target, '.agents', 'skills', 'service-local', 'SKILL.md'), 'local\n');

  run(target, ['codex']);

  assert.equal(fs.existsSync(path.join(target, '.codex', 'config.toml')), true);
  assert.equal(fs.existsSync(path.join(target, '.codex', 'KIT_VERSION')), true);
  assert.equal(fs.existsSync(path.join(target, '.agents', 'skills', 'st-backend-code-review', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(target, '.agents', 'skills', 'service-local', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(target, '.cursor')), false);
});

test('cursor selection remains isolated from Codex payload', (t) => {
  const target = fixture();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  run(target, ['cursor']);

  assert.equal(fs.existsSync(path.join(target, '.cursor', 'KIT_VERSION')), true);
  assert.equal(fs.existsSync(path.join(target, '.codex')), false);
  assert.equal(fs.existsSync(path.join(target, '.agents')), false);
});

test('codex sync removes only stale skills owned by the previous manifest', (t) => {
  const target = fixture();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));
  fs.mkdirSync(path.join(target, '.codex'), { recursive: true });
  fs.writeFileSync(
    path.join(target, '.codex', 'skills-manifest.json'),
    JSON.stringify({ version: 1, skills: ['st-backend-retired-skill'] }),
  );
  fs.mkdirSync(path.join(target, '.agents', 'skills', 'st-backend-retired-skill'), { recursive: true });
  fs.writeFileSync(path.join(target, '.agents', 'skills', 'st-backend-retired-skill', 'SKILL.md'), 'old\n');
  fs.mkdirSync(path.join(target, '.agents', 'skills', 'third-party'), { recursive: true });
  fs.writeFileSync(path.join(target, '.agents', 'skills', 'third-party', 'SKILL.md'), 'keep\n');

  run(target, ['codex']);

  assert.equal(fs.existsSync(path.join(target, '.agents', 'skills', 'st-backend-retired-skill')), false);
  assert.equal(fs.existsSync(path.join(target, '.agents', 'skills', 'third-party', 'SKILL.md')), true);
});

test('codex dry-run does not write target files', (t) => {
  const target = fixture();
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  run(target, ['codex'], { dryRun: true });

  assert.equal(fs.existsSync(path.join(target, '.codex')), false);
  assert.equal(fs.existsSync(path.join(target, '.agents')), false);
  assert.equal(fs.existsSync(path.join(target, 'AGENTS.md')), false);
});
