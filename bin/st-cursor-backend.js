#!/usr/bin/env node
'use strict';

const path = require('path');
const {
  syncKit,
  parseArgs,
  usage,
  KIT_DIRS,
  KIT_NAMES,
  DEFAULT_KITS,
  listAvailableKits,
  resolveKits,
} = require('../lib/sync-kit');

const KIT_ROOT = path.join(__dirname, '..');

const AUTHOR_NAME = 'Filipe Paixão';
const AUTHOR_GITHUB = 'https://github.com/FilipePaixao';
const AUTHOR_CREDIT = `Developed by ${AUTHOR_NAME} · ${AUTHOR_GITHUB}`;

const KIT_LABELS = {
  cursor: 'Cursor (.cursor)',
  claude: 'Claude Code (.claude)',
  codex: 'Codex (.codex)',
};

function isCi() {
  const ci = process.env.CI;
  return ci === 'true' || ci === '1';
}

/** True when we can render an interactive UI (npx in a real terminal). */
function canRenderUi() {
  return Boolean(process.stdout.isTTY) && !isCi();
}

/**
 * Open the interactive panel unless the user opted into non-interactive flags
 * or the environment cannot show a UI (CI / redirected stdout).
 */
function shouldPrompt(options) {
  if (options.yes || options.all || options.kits) return false;
  if (options.interactive) return true;
  return canRenderUi();
}

async function runInteractivePanel(options) {
  const p = require('@clack/prompts');
  const available = listAvailableKits(KIT_ROOT);
  const availableSet = new Set(available);

  p.intro('st-cursor-backend — sync AI backend kit');
  p.note(
    `${AUTHOR_CREDIT}\nUse ↑↓ to navigate, Enter to confirm. Esc cancels.`,
    'About',
  );

  const choice = await p.select({
    message: 'Which tool kits do you want to install?',
    options: [
      ...KIT_NAMES.map((name) => {
        const present = availableSet.has(name);
        return {
          value: name,
          label: KIT_LABELS[name] || name,
          hint: present ? KIT_DIRS[name] : `${KIT_DIRS[name]} — not in package yet`,
        };
      }),
      {
        value: '__all__',
        label: 'All available kits',
        hint:
          available.length > 0
            ? available.map((name) => KIT_DIRS[name]).join(', ')
            : 'none present yet',
      },
      {
        value: '__custom__',
        label: 'Custom selection…',
        hint: 'pick multiple with Space, then Enter',
      },
    ],
    initialValue: DEFAULT_KITS[0],
  });

  if (p.isCancel(choice)) {
    p.cancel('Sync cancelled.');
    process.exit(0);
  }

  let kits;
  if (choice === '__all__') {
    kits = resolveKits({ all: true, kitRoot: KIT_ROOT });
  } else if (choice === '__custom__') {
    const selected = await p.multiselect({
      message: 'Select one or more kits (Space to toggle, Enter to confirm)',
      options: KIT_NAMES.map((name) => {
        const present = availableSet.has(name);
        return {
          value: name,
          label: KIT_LABELS[name] || name,
          hint: present ? KIT_DIRS[name] : `${KIT_DIRS[name]} — not in package yet`,
        };
      }),
      initialValues: [...DEFAULT_KITS],
      required: true,
    });
    if (p.isCancel(selected)) {
      p.cancel('Sync cancelled.');
      process.exit(0);
    }
    kits = selected;
  } else {
    kits = [choice];
  }

  let withPrTemplate = options.withPrTemplate;
  if (!options.withPrTemplate) {
    const seedPr = await p.select({
      message: 'Seed .github/PULL_REQUEST_TEMPLATE.md if missing?',
      options: [
        { value: true, label: 'Yes', hint: 'recommended for first-time setup' },
        { value: false, label: 'No' },
      ],
      initialValue: true,
    });
    if (p.isCancel(seedPr)) {
      p.cancel('Sync cancelled.');
      process.exit(0);
    }
    withPrTemplate = Boolean(seedPr);
  }

  let backup = options.backup;
  if (!options.backup) {
    const doBackup = await p.select({
      message: 'Backup existing kit files before overwrite?',
      options: [
        { value: false, label: 'No' },
        { value: true, label: 'Yes', hint: 'writes .cursor-kit-backup-<timestamp>/' },
      ],
      initialValue: false,
    });
    if (p.isCancel(doBackup)) {
      p.cancel('Sync cancelled.');
      process.exit(0);
    }
    backup = Boolean(doBackup);
  }

  return { kits, withPrTemplate, backup };
}

async function main() {
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

  let kits;
  let withPrTemplate = options.withPrTemplate;
  let backup = options.backup;
  const prompted = shouldPrompt(options);

  if (prompted && !process.stdout.isTTY) {
    console.error(
      'Interactive panel requires a terminal. Use -y, --kit, or --all for non-interactive sync.',
    );
    process.exit(1);
  }

  try {
    if (prompted) {
      const panel = await runInteractivePanel(options);
      kits = panel.kits;
      withPrTemplate = panel.withPrTemplate;
      backup = panel.backup;
    } else {
      kits = resolveKits({
        kits: options.kits,
        all: options.all,
        kitRoot: KIT_ROOT,
      });
    }
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }

  const useClack = canRenderUi();
  let p = null;
  let spinner = null;

  if (useClack) {
    p = require('@clack/prompts');
    if (!prompted) {
      p.intro('st-cursor-backend — sync AI backend kit');
    }
    spinner = p.spinner();
    spinner.start(`Syncing ${kits.join(', ')}…`);
  }

  try {
    const result = syncKit({
      kitRoot: KIT_ROOT,
      target,
      kits,
      dryRun: options.dryRun,
      noDelete: options.noDelete,
      backup,
      forceSpecsReadme: options.forceSpecsReadme,
      withPrTemplate,
      log: useClack
        ? (msg) => {
            if (spinner) spinner.message(msg);
            else console.log(msg);
          }
        : console.log,
      warn: (msg) => {
        if (p && p.log) p.log.warn(msg);
        else console.warn(msg);
      },
    });

    if (spinner) {
      spinner.stop(`Synced: ${result.kits.join(', ')} (v${result.kitVersion})`);
    }
    if (p) {
      p.outro(`Done. See docs/ADOPTION.md for the checklist.\n${AUTHOR_CREDIT}`);
    }
  } catch (err) {
    if (spinner) spinner.stop('Sync failed');
    if (p) p.cancel(err.message || String(err));
    else console.error(err.message || err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
