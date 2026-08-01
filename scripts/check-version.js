#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const versionFile = path.join(root, 'VERSION');
const pkgFile = path.join(root, 'package.json');

const fileVersion = fs.readFileSync(versionFile, 'utf8').trim();
const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));

if (fileVersion !== pkg.version) {
  console.error(
    `Version mismatch: VERSION=${fileVersion} package.json.version=${pkg.version}`,
  );
  process.exit(1);
}

console.log(`Version OK: ${pkg.version}`);
