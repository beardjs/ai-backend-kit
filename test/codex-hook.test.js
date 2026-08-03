'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  evaluate,
  isSensitivePath,
} = require('../.codex/hooks/pre-tool-policy');

function payload(toolName, toolInput) {
  return { hook_event_name: 'PreToolUse', tool_name: toolName, tool_input: toolInput };
}

describe('when classifying a sensitive basename', () => {
  it('should treat .env as sensitive', () => {
    assert.equal(isSensitivePath('.env'), true);
  });

  it('should treat .env.production as sensitive', () => {
    assert.equal(isSensitivePath('/service/.env.production'), true);
  });

  it('should treat credential and key material as sensitive', () => {
    assert.equal(isSensitivePath('/keys/service-account.json'), true);
    assert.equal(isSensitivePath('/keys/private.pem'), true);
  });
});

describe('when classifying a safe template beside a sensitive name', () => {
  it('should allow .env.example', () => {
    assert.equal(isSensitivePath('.env.example'), false);
  });

  it('should allow service-account.json.template', () => {
    assert.equal(isSensitivePath('service-account.json.template'), false);
  });
});

describe('when classifying an empty or blank path', () => {
  it('should not treat empty string as sensitive', () => {
    assert.equal(isSensitivePath(''), false);
  });

  it('should not treat whitespace-only string as sensitive', () => {
    assert.equal(isSensitivePath('   '), false);
  });
});

describe('when the shell command is destructive', () => {
  it('should block git reset --hard', () => {
    assert.ok(evaluate(payload('Bash', { command: 'git reset --hard HEAD~1' })));
  });

  it('should block git push --force', () => {
    assert.ok(evaluate(payload('Bash', { command: 'git push --force origin main' })));
  });

  it('should block kubectl delete against production', () => {
    assert.ok(evaluate(payload('Bash', { command: 'kubectl delete pod api -n production' })));
  });

  it('should block rm -rf and rm -r -f', () => {
    assert.ok(evaluate(payload('Bash', { command: 'rm -rf build' })));
    assert.ok(evaluate(payload('Bash', { command: 'rm -r -f build' })));
  });
});

describe('when a tool tries to read or patch secrets', () => {
  it('should block cat of .env.local', () => {
    assert.ok(evaluate(payload('Bash', { command: 'cat .env.local' })));
  });

  it('should block cat of .env chained with another command', () => {
    assert.ok(evaluate(payload('Bash', { command: 'cat .env; echo done' })));
  });

  it('should block MCP and view_image reads of credential paths', () => {
    assert.ok(evaluate(payload('mcp__filesystem__read_file', { path: '/app/credentials.json' })));
    assert.ok(evaluate(payload('view_image', { path: '/app/client.key' })));
  });

  it('should block apply_patch that updates .env', () => {
    assert.ok(evaluate(payload('apply_patch', { command: '*** Begin Patch\n*** Update File: .env\n*** End Patch' })));
  });
});

describe('when the command is ordinary or uses a safe template', () => {
  it('should allow yarn test:unit', () => {
    assert.equal(evaluate(payload('Bash', { command: 'yarn test:unit' })), null);
  });

  it('should allow cat of .env.example', () => {
    assert.equal(evaluate(payload('Bash', { command: 'cat .env.example' })), null);
  });

  it('should allow reading ordinary source paths', () => {
    assert.equal(evaluate(payload('mcp__filesystem__read_file', { path: '/app/src/app.ts' })), null);
  });
});
