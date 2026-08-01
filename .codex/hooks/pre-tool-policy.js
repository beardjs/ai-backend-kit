#!/usr/bin/env node
'use strict';

const path = require('path');

const DESTRUCTIVE_PATTERNS = [
  /\brm\s+(?:-[^\s]+\s+)*-(?:r[^\s]*f|f[^\s]*r)\b/i,
  /\brm\b(?=[^\n]*\s-r(?:\s|$))(?=[^\n]*\s-f(?:\s|$))/i,
  /\bgit\s+push\b[^\n]*(?:--force(?:-with-lease)?|\s-f(?:\s|$))/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bkubectl\b[^\n]*(?:(?:\s|--context[=\s]+)production\b|\s-n\s+prod(?:uction)?\b)/i,
  /\bdrop\s+(?:database|schema)\b/i,
  /\bmkfs(?:\.|\s)|\bdd\s+[^\n]*\bif=/i,
];

const SENSITIVE_NAMES = new Set([
  '.env',
  '.env.local',
  '.env.production',
  '.env.staging',
  'credentials.json',
  'service-account.json',
]);
const SAFE_TEMPLATE_SUFFIXES = ['.example', '.sample', '.template'];
const SENSITIVE_SUFFIXES = ['.pem', '.p12', '.key'];
const PATH_KEYS = /(?:^|_)(?:file|path|filename|file_path|filePath)$/i;

function isSensitivePath(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const name = path.basename(value.trim()).toLowerCase();
  if (SAFE_TEMPLATE_SUFFIXES.some((suffix) => name.endsWith(suffix))) return false;
  if (SENSITIVE_NAMES.has(name) || name.startsWith('.env.')) return true;
  return SENSITIVE_SUFFIXES.some((suffix) => name.endsWith(suffix));
}

function collectPathValues(value, key = '', output = []) {
  if (typeof value === 'string') {
    if (PATH_KEYS.test(key) || key === 'command') output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectPathValues(item, key, output);
    return output;
  }
  if (value && typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      collectPathValues(childValue, childKey, output);
    }
  }
  return output;
}

function commandReadsSensitiveFile(command) {
  if (typeof command !== 'string') return false;
  const readsFile = /(?:^|[;&|]\s*)(?:cat|head|tail|less|more|sed|awk|source|\.)\s+/i.test(command);
  if (!readsFile) return false;
  const tokens = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  return tokens.some((token) => isSensitivePath(token.replace(/^["']+|["';|&<>]+$/g, '')));
}

function patchTouchesSensitiveFile(command) {
  if (typeof command !== 'string') return false;
  const paths = [];
  for (const line of command.split(/\r?\n/)) {
    const match = line.match(/^\*\*\* (?:Add|Update|Delete) File:\s+(.+)$/);
    if (match) paths.push(match[1].trim());
  }
  return paths.some(isSensitivePath);
}

function deny(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  };
}

function evaluate(payload) {
  const input = payload && typeof payload.tool_input === 'object' ? payload.tool_input : {};
  const command = typeof input.command === 'string' ? input.command : '';

  if (DESTRUCTIVE_PATTERNS.some((pattern) => pattern.test(command))) {
    return deny('Blocked a destructive or production-targeting command. Use a recoverable alternative or request explicit user handling.');
  }

  if (commandReadsSensitiveFile(command)) {
    return deny('Blocked reading a credential or environment file. Use configuration interfaces or ask for non-secret guidance.');
  }

  if (payload.tool_name === 'apply_patch' && patchTouchesSensitiveFile(command)) {
    return deny('Blocked modification of a credential or environment file. Update a safe template instead.');
  }

  const sensitivePath = collectPathValues(input).find((candidate) => isSensitivePath(candidate));
  if (sensitivePath) {
    return deny(`Blocked access to sensitive file: ${path.basename(sensitivePath)}`);
  }

  return null;
}

async function readStdin() {
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

async function main() {
  try {
    const raw = await readStdin();
    const result = evaluate(JSON.parse(raw));
    if (result) process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`Codex safety hook rejected an invalid payload: ${error.message}\n`);
    process.exitCode = 2;
  }
}

if (require.main === module) main();

module.exports = {
  collectPathValues,
  commandReadsSensitiveFile,
  evaluate,
  isSensitivePath,
  patchTouchesSensitiveFile,
};
