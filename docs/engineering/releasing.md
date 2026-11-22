# Releasing

Versions are bare `x.y.z`. Tags carry no `v`; `.npmrc` sets `tag-version-prefix=""`.

1. On an up-to-date `main` with a green CI, run `npm version 0.2.0` (or `minor`/`patch`). npm's `version` hook runs `scripts/version-bump.mjs`:
   - it copies the version into `manifest.json`;
   - it adds `"0.2.0": <minAppVersion>` to `versions.json`;
   - it stages both files.

   npm then commits and tags `0.2.0`. The bump refuses a version that is not greater than the current one.
2. Push the commit and the tag: `git push --follow-tags`.
3. `.github/workflows/release.yml` runs `npm run verify`, then `npm run release:package -- --tag 0.2.0`. That step fails when the tag and `manifest.json` disagree. It then attests the three assets and creates a GitHub release with `main.js`, `manifest.json` and `styles.css`.
4. To install by hand, copy those three files to `<vault>/.obsidian/plugins/weg-manager/` and enable the plugin.

To stage a release locally: `npm run build && npm run release:package` writes `release/weg-manager/`.

Raise `minAppVersion` in `manifest.json` before you bump whenever the plugin starts using a newer Obsidian API.

The next release is 0.2.0, a pre-release (see *Beta testing with BRAT* below) for the manual checks in a personal vault (see [testing.md](testing.md#manual-checks-in-obsidian)).

## Build provenance

Before `gh release create`, the workflow runs `actions/attest` (v4, pinned by commit SHA like every action) over `release/weg-manager/main.js`, `manifest.json` and `styles.css`. This is the step from the Obsidian developer docs' guide *Release your plugin with GitHub Actions*, which recommends it for a community-directory submission. It needs the workflow permissions `contents: write`, `id-token: write` and `attestations: write`; `release.yml` requests all three itself.

The attestation is a signed statement that the files were built by this workflow from this commit. Anyone can check a downloaded asset with the GitHub CLI:

```sh
gh attestation verify main.js --repo <owner>/weg-manager
```

The attested files are the same bytes that the release carries, because both steps read `release/weg-manager/`.

## Beta testing with BRAT

Obsidian has no beta channel. The developer docs (*Beta-testing plugins*) recommend [BRAT](https://tfthacker.com/BRAT) for testers before the plugin is listed. Every GitHub release of this repository already has what BRAT needs: a bare semver tag and the three assets. A tester installs BRAT, chooses *Add beta plugin* and enters the repository's URL; BRAT then installs the newest release and offers updates. Mark a release as a *pre-release* on GitHub to give it to BRAT testers without announcing it otherwise.
