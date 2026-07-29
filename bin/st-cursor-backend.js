#!/usr/bin/env node
'use strict';

const path = require('path');
const { syncKit, parseArgs, usage } = require('../lib/sync-kit');

const KIT_ROOT = path.join(__dirname, '..');

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    console.error(usage());
    process.exit(1);
  }

  if (options.help) {
    process.stdout.write(usage());
    process.exit(0);
  }

  const target = options.target ? path.resolve(options.target) : process.cwd();

  try {
    syncKit({
      kitRoot: KIT_ROOT,
      target,
      dryRun: options.dryRun,
      noDelete: options.noDelete,
      backup: options.backup,
      forceSpecsReadme: options.forceSpecsReadme,
      withPrTemplate: options.withPrTemplate,
    });
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
