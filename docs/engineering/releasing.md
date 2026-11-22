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
   - `build` (read-only token, credentials not persisted, `fetch-depth: 0`), in this order:
     1. Node from `.nvmrc`, then `node scripts/release-version.mjs`: the version (the tag, or the input of a start by hand; a start by hand must be on `main` and its tag must not exist yet).
     2. The commit must be an ancestor of `origin/main`: release from `main` only.
     3. `node scripts/check-versions.mjs --tag 0.3.0`, before the install and the 20 to 30 minutes of gate and e2e: the tag equals the `manifest.json` version, `package.json` and `manifest.json` carry the same version, and `versions.json` has the entry for it, equal to `minAppVersion`. The same script runs without `--tag` as `npm run check:versions`, the fourth check of the gate's first stage.
     4. `npm ci`, then `npm run verify` (the gate: it builds and checks `dist/` and `THIRD-PARTY-NOTICES.txt`).
     5. `npm run release:package -- --tag 0.3.0` stages the files **right after the gate**, and the job records their sha256 hashes.
     6. The real-Obsidian e2e suite (`npm run test:e2e`, set up as in `ci.yml`). It rebuilds `dist/` and starts cached Obsidian and chromedriver binaries, which is why the staged files are taken before it.
     7. `sha256sum --check` of the staged files against the hashes of step 5: the job fails when `main.js`, `manifest.json`, `styles.css` or the notices file changed meanwhile. Only then `release/` (the folder `weg-manager/` with the three plugin files, and `THIRD-PARTY-NOTICES.txt` beside it) is uploaded as the artifact `release-files`.

     So the released files are the ones the gate built. The workflow does not rely on the e2e rebuild producing the same bytes (two builds in a row on one machine gave identical files, which was not shown on the runner).
   - `release` (`contents: write`, `id-token: write`, `attestations: write`; no checkout, no `npm`) downloads that artifact, attests the four assets and creates the GitHub release with `main.js`, `manifest.json`, `styles.css` and `THIRD-PARTY-NOTICES.txt`. The release is marked a pre-release while the major version is 0 (the tag starts with `0.`).

   `release:package` fails when the tag and `manifest.json` disagree, when `dist/` fails the `check:dist` invariants (a stale or development build), when `versions.json` has no entry for the manifest version equal to its `minAppVersion`, or when `THIRD-PARTY-NOTICES.txt` is missing or empty.
4. To install by hand, copy the three plugin files (`main.js`, `manifest.json`, `styles.css`) to `<vault>/.obsidian/plugins/weg-manager/` and enable the plugin.

To stage a release locally: `npm run build && npm run release:package` writes `release/weg-manager/` and `release/THIRD-PARTY-NOTICES.txt`. It refuses a `dist/` that is not a fresh production build of the current `manifest.json`.

The workflow first ran for 0.2.0, started by hand, and passed; the start by a pushed tag has not run yet. A failure before the last step of the `release` job leaves nothing behind (the tag is created last, with the release): fix the cause on `main` and start it again with the same version. A run started by a tag that fails leaves the tag without a release: fix the cause on `main`, delete the tag locally and on GitHub, and start again (by hand with the same version, or with a new tag).

**What a failure in the last step can leave behind.** `gh release create` makes a draft release, uploads the four assets and then publishes it, in separate API calls; the tag of a start by hand is created at the publish. If the upload or the publish fails, a **draft release** with the version's name stays on the Releases page, and so do the attestations the run already made (signed statements about those exact files; they do no harm). The workflow does not delete the draft, on purpose: a step that deletes a release after a failure must be sure that the release is the draft of this run, and a wrong condition or a failed lookup would remove a published release, which cannot be undone. Whether `gh` finds a draft by its tag has not been shown on a real failure. So look at *Releases* before you start again and delete a draft of that version by hand (in the browser, or `gh release delete 0.3.0 --yes`, which leaves a tag in place). A second run with the same version would otherwise make a second draft. A draft is visible to people with write access only; nothing reaches BRAT or Obsidian until a release is published.

Raise `minAppVersion` in `manifest.json` before you bump whenever the plugin starts using a newer Obsidian API.

0.2.0 is the first release: a pre-release (see *Beta testing with BRAT* below) for the owner's manual checks in a personal vault (see [testing.md](testing.md#manual-checks-in-obsidian)).

## Third-party notices

The release has four assets. Obsidian and BRAT install the first three (`main.js`, `manifest.json`, `styles.css`) and ignore the fourth, `THIRD-PARTY-NOTICES.txt`: the licence texts of the third-party packages that are bundled into `main.js` and `styles.css`. The minified `main.js` does not carry those texts, and the licences ask for them to travel with the code. The file is checked into the repository root and generated; do not edit it by hand.

Which packages: those the production build includes, not the dependency tree. `configs/vite.config.ts` runs the plugin from `scripts/bundled-packages.mjs`, which writes `reports/bundled-packages.json` (not checked in) after each production build: the packages of the bundler's module list, the icon collections Nuxt UI turns into `virtual:nuxt-ui-icons` (`@iconify-json/*`, which no module id points at), and the packages the plugin's style sheets `@import` (Tailwind, Nuxt UI). The file also holds the sha256 of the `main.js` it describes, so a list from an older build is refused. `scripts/third-party-notices.mjs` then reads each package's `package.json` (licence id) and its `LICENSE`, `LICENCE`, `COPYING` and `NOTICE` files from `node_modules/`. Packages with the same text share one section, and a text that differs, such as MIT with another copyright line, stays its own section. The file holds no version number, so a Dependabot version bump leaves it unchanged unless a package enters or leaves the bundle or its licence text changes.

A package without a licence file gets the standard MIT or ISC text with its `package.json` `author` as copyright line. Such an entry is marked: `(MIT, licence text generated)` in the index of `THIRD-PARTY-NOTICES.txt`, a line `Licence text: generated from the standard text, the package ships no licence file` in its section, and both `npm run notices` and `npm run check:notices` print `licence text generated (no licence file): <names>`. A new name there is a licence text nobody wrote for the package: check the package's repository for its real text before you commit (an override with the verbatim text turns the mark off). An override that gives its text verbatim is not marked; none of the packages in the bundle is marked today. When that is not possible, or when `package.json` has no `license` field, the script fails and names the package; the way out is an entry with its evidence in `scripts/notice-overrides.mjs` (`vaul-vue` and `@iconify-json/lucide` have one).

Commands:

- `npm run notices` runs a production build and rewrites `THIRD-PARTY-NOTICES.txt`. Commit the result.
- `npm run check:notices` regenerates in memory and exits 1 when the file on disk differs. It is the last step of `npm run verify`, after `build`, because it reads the fresh `dist/`.

When the gate says `THIRD-PARTY-NOTICES.txt is out of date`, for example on a Dependabot pull request that adds a package to the bundle or changes a licence text, run `npm run notices`, read the diff (a new package, a new licence id, a changed text) and commit the file with the change. A licence you do not know, or a copyleft one, is a question for the owner, not something to commit. When the gate says `run "npm run build" first`, `reports/bundled-packages.json` is missing or belongs to another `dist/`: run `npm run build`.

`release:package` copies the file to `release/THIRD-PARTY-NOTICES.txt`, beside `release/weg-manager/` and not inside it: the folder a user copies into `<vault>/.obsidian/plugins/weg-manager/` stays exactly the three files Obsidian loads.

## Build provenance

Before `gh release create`, the `release` job runs `actions/attest` (v4, pinned by commit SHA like every action) over the downloaded `release/weg-manager/main.js`, `manifest.json`, `styles.css` and `release/THIRD-PARTY-NOTICES.txt`. This is the step from the Obsidian developer docs' guide *Release your plugin with GitHub Actions*, which recommends it for a community-directory submission. It needs the permissions `contents: write`, `id-token: write` and `attestations: write`. `release.yml` grants them to the `release` job only, which runs no repository code and no install scripts; the workflow's default is `contents: read`.

The attestation is a signed statement that the files were made by a GitHub Actions workflow of this repository. Check a downloaded asset with the GitHub CLI, and pin the workflow and the ref, not only the repository:

```sh
# release started by hand (the workflow runs on main)
gh attestation verify main.js --repo <owner>/weg-manager \
  --signer-workflow <owner>/weg-manager/.github/workflows/release.yml \
  --source-ref refs/heads/main

# release started by a pushed tag
gh attestation verify main.js --repo <owner>/weg-manager \
  --signer-workflow <owner>/weg-manager/.github/workflows/release.yml \
  --source-ref refs/tags/0.3.0
```

`--repo` alone accepts an attestation made by any workflow, on any branch or tag, of the repository: a run of a changed `release.yml` on a feature branch would pass it. `--signer-workflow` requires that `release.yml` signed it, and `--source-ref` that it ran on `main` (a start by hand) or on the tag (a start by tag), so a run of a changed `release.yml` on another branch no longer passes. The same holds for the other three assets. (`--cert-identity https://github.com/<owner>/weg-manager/.github/workflows/release.yml@refs/heads/main` is the exact-match form of the pair.) The flags are those of `gh attestation verify --help` in GitHub CLI 2.89.0; the command was not run against a real release for this note.

The attested files are the same bytes that the release carries, because both steps read the one downloaded artifact.

## Beta testing with BRAT

Obsidian has no beta channel. The developer docs (*Beta-testing plugins*) recommend [BRAT](https://tfthacker.com/BRAT) for testers before the plugin is listed. Every GitHub release of this repository already has what BRAT needs: a bare semver tag and the three assets. A tester installs BRAT, chooses *Add beta plugin* and enters the repository's URL; BRAT then installs the newest release and offers updates. A release with major version 0 is created with `--prerelease` (decided from the tag in the workflow), so it reaches BRAT testers without being listed as the latest release. From 1.0.0 on, releases are normal.
