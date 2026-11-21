# GitHub setup

The repository's CI runs on GitHub Actions (decided 2026-11-21, replacing the blueprint's Azure Pipelines). The workflows are committed; the steps below change repository settings and are yours to do. An agent must not perform them.

## Workflows

| File | Trigger | What it does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | push to `main`, every pull request | job `verify`: `npm ci`, `npm run verify`; uploads `reports` (JUnit, Cobertura) even on failure and `plugin` (`dist/`) on success. Job `e2e`: `npm run test:e2e` in the latest real Obsidian under Xvfb, with Obsidian kept in the Actions cache |
| `.github/workflows/nightly-mutation.yml` | nightly 02:17 UTC on the default branch, or by hand | `npm run test:mutation:full`; uploads `reports/mutation/` |
| `.github/workflows/release.yml` | a pushed tag `x.y.z` (no `v`) | `npm run verify`, `npm run release:package -- --tag x.y.z`, then a GitHub release with `main.js`, `manifest.json` and `styles.css` |

All logic lives in npm scripts. The YAML only installs Node from `.nvmrc` and calls them, so a local `npm run verify` and CI run the same gate.

## Steps for you

1. **Allow Actions.** *Settings → Actions → General*: allow actions and reusable workflows (at least the `actions/*` ones). Under *Workflow permissions*, the default read-only token is enough; `release.yml` asks for `contents: write` itself.
2. **Protect `main`.** *Settings → Rules → Rulesets → New branch ruleset* for `main`:
   - require a pull request before merging, with at least one approval;
   - require status checks to pass, and add **`CI / verify`** (it appears after the workflow has run once);
   - add **`CI / e2e`** too, once they have run without a flake for about two weeks; until then they report but do not block;
   - block force pushes;
   - allow only squash merges (*Settings → General → Pull Requests*).
3. **Prove the rule.** Open a pull request containing a planted type error (for example `const x: number = "a";` in `src/domain/settings.ts`). The `verify` check must fail and the merge button must stay blocked. Close the PR without merging.
4. **First release.** See [releasing.md](releasing.md). The first tag also shows whether the `release` workflow may create releases in your repository.

## Distribution

The GitHub release carries the three files Obsidian installs. Listing in Obsidian's community plugin directory is a separate submission and out of scope. Until then, install by copying the release files to `<vault>/.obsidian/plugins/weg-manager/`.
