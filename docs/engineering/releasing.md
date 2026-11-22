# Releasing

Versions are bare `x.y.z`. Tags carry no `v`; `.npmrc` sets `tag-version-prefix=""`.

1. On an up-to-date `main` with a green CI, run `npm version 0.2.0` (or `minor`/`patch`). npm's `version` hook runs `scripts/version-bump.mjs`:
   - it copies the version into `manifest.json`;
   - it adds `"0.2.0": <minAppVersion>` to `versions.json`;
   - it stages both files.

   npm then commits and tags `0.2.0`. The bump refuses a version that is not greater than the current one.
2. Push the commit and the tag: `git push --follow-tags`.
3. `.github/workflows/release.yml` runs two jobs:
   - `build` (read-only token, credentials not persisted, `fetch-depth: 0`) fails unless the tagged commit is an ancestor of `origin/main`: tag from `main` only. It then runs `npm ci`, `npm run verify` and the real-Obsidian e2e suite (`npm run test:e2e`, set up as in `ci.yml`), then `npm run release:package -- --tag 0.2.0` and uploads `release/weg-manager/` as the artifact `release-files`.
   - `release` (`contents: write`, `id-token: write`, `attestations: write`; no checkout, no `npm`) downloads that artifact, attests the three assets and creates the GitHub release with `main.js`, `manifest.json` and `styles.css`. The release is marked a pre-release while the major version is 0 (the tag starts with `0.`).

   `release:package` fails when the tag and `manifest.json` disagree, when `dist/` fails the `check:dist` invariants (a stale or development build), or when `versions.json` has no entry for the manifest version equal to its `minAppVersion`.
4. To install by hand, copy those three files to `<vault>/.obsidian/plugins/weg-manager/` and enable the plugin.

To stage a release locally: `npm run build && npm run release:package` writes `release/weg-manager/`. It refuses a `dist/` that is not a fresh production build of the current `manifest.json`.

The workflow has never run. A failed run leaves the tag without a release: fix the cause on `main`, delete the tag locally and on GitHub, and tag again with a new version (a version number is not reused once the bump commit is on `main`).

Raise `minAppVersion` in `manifest.json` before you bump whenever the plugin starts using a newer Obsidian API.

The next release is 0.2.0, a pre-release (see *Beta testing with BRAT* below) for the manual checks in a personal vault (see [testing.md](testing.md#manual-checks-in-obsidian)).

## Build provenance

Before `gh release create`, the `release` job runs `actions/attest` (v4, pinned by commit SHA like every action) over the downloaded `release/weg-manager/main.js`, `manifest.json` and `styles.css`. This is the step from the Obsidian developer docs' guide *Release your plugin with GitHub Actions*, which recommends it for a community-directory submission. It needs the permissions `contents: write`, `id-token: write` and `attestations: write`. `release.yml` grants them to the `release` job only, which runs no repository code and no install scripts; the workflow's default is `contents: read`.

The attestation is a signed statement that the files were built by this workflow from this commit. Anyone can check a downloaded asset with the GitHub CLI:

```sh
gh attestation verify main.js --repo <owner>/weg-manager
```

The attested files are the same bytes that the release carries, because both steps read the one downloaded artifact.

## Beta testing with BRAT

Obsidian has no beta channel. The developer docs (*Beta-testing plugins*) recommend [BRAT](https://tfthacker.com/BRAT) for testers before the plugin is listed. Every GitHub release of this repository already has what BRAT needs: a bare semver tag and the three assets. A tester installs BRAT, chooses *Add beta plugin* and enters the repository's URL; BRAT then installs the newest release and offers updates. A release with major version 0 is created with `--prerelease` (decided from the tag in the workflow), so it reaches BRAT testers without being listed as the latest release. From 1.0.0 on, releases are normal.
