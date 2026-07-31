'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  evaluate,
  isSensitivePath,
} = require('../.codex/hooks/pre-tool-policy');

function payload(toolName, toolInput) {
  return { hook_event_name: 'PreToolUse', tool_name: toolName, tool_input: toolInput };
}

test('sensitive path detection blocks secrets but allows templates', () => {
  assert.equal(isSensitivePath('.env'), true);
  assert.equal(isSensitivePath('/service/.env.production'), true);
  assert.equal(isSensitivePath('/keys/service-account.json'), true);
  assert.equal(isSensitivePath('/keys/private.pem'), true);
  assert.equal(isSensitivePath('.env.example'), false);
  assert.equal(isSensitivePath('service-account.json.template'), false);
});

test('hook blocks destructive shell commands', () => {
  assert.ok(evaluate(payload('Bash', { command: 'git reset --hard HEAD~1' })));
  assert.ok(evaluate(payload('Bash', { command: 'git push --force origin main' })));
  assert.ok(evaluate(payload('Bash', { command: 'kubectl delete pod api -n production' })));
  assert.ok(evaluate(payload('Bash', { command: 'rm -rf build' })));
  assert.ok(evaluate(payload('Bash', { command: 'rm -r -f build' })));
});

test('hook blocks secret reads through shell and tool path arguments', () => {
  assert.ok(evaluate(payload('Bash', { command: 'cat .env.local' })));
  assert.ok(evaluate(payload('Bash', { command: 'cat .env; echo done' })));
  assert.ok(evaluate(payload('mcp__filesystem__read_file', { path: '/app/credentials.json' })));
  assert.ok(evaluate(payload('view_image', { path: '/app/client.key' })));
  assert.ok(evaluate(payload('apply_patch', { command: '*** Begin Patch\n*** Update File: .env\n*** End Patch' })));
});

test('hook allows ordinary commands and safe environment templates', () => {
  assert.equal(evaluate(payload('Bash', { command: 'yarn test:unit' })), null);
  assert.equal(evaluate(payload('Bash', { command: 'cat .env.example' })), null);
  assert.equal(evaluate(payload('mcp__filesystem__read_file', { path: '/app/src/app.ts' })), null);
});
