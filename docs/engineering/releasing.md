# Releasing

Versions are bare `x.y.z`. Tags carry no `v`; `.npmrc` sets `tag-version-prefix=""`.

1. On an up-to-date `main` with a green CI, run `npm version 0.2.0` (or `minor`/`patch`). npm's `version` hook runs `scripts/version-bump.mjs`:
   - it copies the version into `manifest.json`;
   - it adds `"0.2.0": <minAppVersion>` to `versions.json`;
   - it stages both files.

   npm then commits and tags `0.2.0`. The bump refuses a version that is not greater than the current one.
2. Push the commit and the tag: `git push --follow-tags`.
3. `.github/workflows/release.yml` runs `npm run verify`, then `npm run release:package -- --tag 0.2.0`. That step fails when the tag and `manifest.json` disagree. The workflow then creates a GitHub release with `main.js`, `manifest.json` and `styles.css`.
4. To install by hand, copy those three files to `<vault>/.obsidian/plugins/weg-manager/` and enable the plugin.

To stage a release locally: `npm run build && npm run release:package` writes `release/weg-manager/`.

Raise `minAppVersion` in `manifest.json` before you bump whenever the plugin starts using a newer Obsidian API.
