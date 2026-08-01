'use strict';

/**
 * Kit release on `main`: bump SemVer from Conventional Commits, update
 * CHANGELOG.md + VERSION + package.json, publish `@beardjs/ai-backend-kit`,
 * push release commit/tag, and create a GitHub Release.
 */
module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'revert', release: 'patch' },
          { type: 'docs', scope: 'readme', release: 'patch' },
          { type: 'chore', scope: 'release', release: false },
          { breaking: true, release: 'major' },
        ],
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle:
          '# Changelog\n\nAll notable changes to the **ai-backend-kit** agent kits are documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\nKit version lives in [`VERSION`](VERSION). After sync, the applied version is stamped at `<kit-dir>/KIT_VERSION` in the target service (e.g. `.cursor/KIT_VERSION`).\n\n> **Note:** Service package releases (`yarn release` / semantic-release) are separate from this kit version. See [`.cursor/rules/rule.release.mdc`](.cursor/rules/rule.release.mdc).',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          'printf "%s\\n" "${nextRelease.version}" > VERSION && node scripts/check-version.js',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json', 'CHANGELOG.md', 'VERSION'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
};
