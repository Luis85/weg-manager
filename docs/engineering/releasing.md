# Releasing

Versions are bare `x.y.z`. Tags carry no `v`; `.npmrc` sets `tag-version-prefix=""`.

1. On a branch from an up-to-date `main` with a green CI, run `npm version 0.3.0 --no-git-tag-version` (or `minor`/`patch`). npm's `version` hook runs `scripts/version-bump.mjs`:
   - it copies the version into `manifest.json`;
   - it adds `"0.3.0": <minAppVersion>` to `versions.json`;
   - it stages both files.

   The bump refuses a version that is not greater than the current one. Commit `package.json`, `package-lock.json`, `manifest.json` and `versions.json` (`chore: release 0.3.0`) and bring the commit to `main` through a pull request, like every change.
2. When the pull request is merged and CI on `main` is green, start the release. A release publishes, so start it only when the owner asked for it. Either way works:
   - **By hand, the way for an agent:** run the workflow `Release` on `main` with the input `version` set to the new version. In the browser: Actions, Release, "Run workflow". With the GitHub CLI: `gh workflow run release.yml --ref main -f version=0.3.0`. An agent with the GitHub tools starts `release.yml` on the ref `main` with the input `version`. No tag has to be pushed: the workflow creates the tag on the commit it built, together with the release. It refuses a ref other than `main`, a version that is not a bare `x.y.z`, a version that differs from `manifest.json`, and a version that already has a tag.
   - **By tag:** `git tag 0.3.0 origin/main && git push origin 0.3.0`.

   (Where direct pushes to `main` are allowed, plain `npm version 0.3.0` on `main` followed by `git push --follow-tags` bumps and tags in one step.)
3. `.github/workflows/release.yml` runs two jobs:
   - `build` (read-only token, credentials not persisted, `fetch-depth: 0`) resolves the version (the tag, or the input of a start by hand) and fails unless the commit is an ancestor of `origin/main`: release from `main` only. It then runs `npm ci`, `npm run verify` and the real-Obsidian e2e suite (`npm run test:e2e`, set up as in `ci.yml`), then `npm run release:package -- --tag 0.3.0` and uploads `release/` (the folder `weg-manager/` with the three plugin files, and `THIRD-PARTY-NOTICES.txt` beside it) as the artifact `release-files`.
   - `release` (`contents: write`, `id-token: write`, `attestations: write`; no checkout, no `npm`) downloads that artifact, attests the four assets and creates the GitHub release with `main.js`, `manifest.json`, `styles.css` and `THIRD-PARTY-NOTICES.txt`. The release is marked a pre-release while the major version is 0 (the tag starts with `0.`).

   `release:package` fails when the tag and `manifest.json` disagree, when `dist/` fails the `check:dist` invariants (a stale or development build), when `versions.json` has no entry for the manifest version equal to its `minAppVersion`, or when `THIRD-PARTY-NOTICES.txt` is missing or empty.
4. To install by hand, copy the three plugin files (`main.js`, `manifest.json`, `styles.css`) to `<vault>/.obsidian/plugins/weg-manager/` and enable the plugin.

To stage a release locally: `npm run build && npm run release:package` writes `release/weg-manager/` and `release/THIRD-PARTY-NOTICES.txt`. It refuses a `dist/` that is not a fresh production build of the current `manifest.json`.

The workflow has never run. A run started by hand that fails leaves nothing behind (the tag is created last, with the release): fix the cause on `main` and start it again with the same version. A run started by a tag that fails leaves the tag without a release: fix the cause on `main`, delete the tag locally and on GitHub, and start again (by hand with the same version, or with a new tag).

Raise `minAppVersion` in `manifest.json` before you bump whenever the plugin starts using a newer Obsidian API.

0.2.0 is the first release: a pre-release (see *Beta testing with BRAT* below) for the owner's manual checks in a personal vault (see [testing.md](testing.md#manual-checks-in-obsidian)).

## Third-party notices

The release has four assets. Obsidian and BRAT install the first three (`main.js`, `manifest.json`, `styles.css`) and ignore the fourth, `THIRD-PARTY-NOTICES.txt`: the licence texts of the third-party packages that are bundled into `main.js` and `styles.css`. The minified `main.js` does not carry those texts, and the licences ask for them to travel with the code. The file is checked into the repository root and generated; do not edit it by hand.

Which packages: those the production build includes, not the dependency tree. `configs/vite.config.ts` runs the plugin from `scripts/bundled-packages.mjs`, which writes `reports/bundled-packages.json` (not checked in) after each production build: the packages of the bundler's module list, the icon collections Nuxt UI turns into `virtual:nuxt-ui-icons` (`@iconify-json/*`, which no module id points at), and the packages the plugin's style sheets `@import` (Tailwind, Nuxt UI). The file also holds the sha256 of the `main.js` it describes, so a list from an older build is refused. `scripts/third-party-notices.mjs` then reads each package's `package.json` (licence id) and its `LICENSE`, `LICENCE`, `COPYING` and `NOTICE` files from `node_modules/`. Packages with the same text share one section, and a text that differs, such as MIT with another copyright line, stays its own section. The file holds no version number, so a Dependabot version bump leaves it unchanged unless a package enters or leaves the bundle or its licence text changes.

A package without a licence file gets the standard MIT or ISC text with its `package.json` `author` as copyright line. When that is not possible, or when `package.json` has no `license` field, the script fails and names the package; the way out is an entry with its evidence in `scripts/notice-overrides.mjs` (`vaul-vue` and `@iconify-json/lucide` have one).

Commands:

- `npm run notices` runs a production build and rewrites `THIRD-PARTY-NOTICES.txt`. Commit the result.
- `npm run check:notices` regenerates in memory and exits 1 when the file on disk differs. It is the last step of `npm run verify`, after `build`, because it reads the fresh `dist/`.

When the gate says `THIRD-PARTY-NOTICES.txt is out of date`, for example on a Dependabot pull request that adds a package to the bundle or changes a licence text, run `npm run notices`, read the diff (a new package, a new licence id, a changed text) and commit the file with the change. A licence you do not know, or a copyleft one, is a question for the owner, not something to commit. When the gate says `run "npm run build" first`, `reports/bundled-packages.json` is missing or belongs to another `dist/`: run `npm run build`.

`release:package` copies the file to `release/THIRD-PARTY-NOTICES.txt`, beside `release/weg-manager/` and not inside it: the folder a user copies into `<vault>/.obsidian/plugins/weg-manager/` stays exactly the three files Obsidian loads.

## Build provenance

Before `gh release create`, the `release` job runs `actions/attest` (v4, pinned by commit SHA like every action) over the downloaded `release/weg-manager/main.js`, `manifest.json`, `styles.css` and `release/THIRD-PARTY-NOTICES.txt`. This is the step from the Obsidian developer docs' guide *Release your plugin with GitHub Actions*, which recommends it for a community-directory submission. It needs the permissions `contents: write`, `id-token: write` and `attestations: write`. `release.yml` grants them to the `release` job only, which runs no repository code and no install scripts; the workflow's default is `contents: read`.

The attestation is a signed statement that the files were built by this workflow from this commit. Anyone can check a downloaded asset with the GitHub CLI:

```sh
gh attestation verify main.js --repo <owner>/weg-manager
```

The attested files are the same bytes that the release carries, because both steps read the one downloaded artifact.

## Beta testing with BRAT

Obsidian has no beta channel. The developer docs (*Beta-testing plugins*) recommend [BRAT](https://tfthacker.com/BRAT) for testers before the plugin is listed. Every GitHub release of this repository already has what BRAT needs: a bare semver tag and the three assets. A tester installs BRAT, chooses *Add beta plugin* and enters the repository's URL; BRAT then installs the newest release and offers updates. A release with major version 0 is created with `--prerelease` (decided from the tag in the workflow), so it reaches BRAT testers without being listed as the latest release. From 1.0.0 on, releases are normal.
