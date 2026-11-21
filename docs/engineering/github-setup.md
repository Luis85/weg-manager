# GitHub setup

The repository's CI runs on GitHub Actions (decided 2026-11-21, replacing the Azure Pipelines of the [archived blueprint](../plans/archive/obsidian-plugin-shell-blueprint.md)). The workflows are committed; the steps below change repository settings and are yours to do. An agent must not perform them.

## Workflows

| File | Trigger | What it does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | push to `main`, every pull request | job `verify`: `npm ci`, `npm run verify`; uploads `reports` (JUnit, Cobertura) even on failure and `plugin` (`dist/`) on success. Job `e2e`: `npm run test:e2e` in the latest real Obsidian under Xvfb, with Obsidian kept in the Actions cache. Job `scanner-lint`: `npm run lint:scanner`, informational, never fails the workflow (see [testing.md](testing.md#scanner-equivalent-lint)). Job `skills`: the Python tests in `skills/tests/` and `python3 skills/package_claude_skills.py`; uploads `claude-skills` (the skill ZIP) |
| `.github/workflows/nightly-mutation.yml` | nightly 02:17 UTC on the default branch, or by hand | `npm run test:mutation:full`; uploads `reports/mutation/` |
| `.github/workflows/release.yml` | a pushed tag `x.y.z` (no `v`) | `npm run verify`, `npm run release:package -- --tag x.y.z`, a build-provenance attestation of the three assets (`actions/attest`), then a GitHub release with `main.js`, `manifest.json` and `styles.css` |

All logic lives in npm scripts. The YAML only installs Node from `.nvmrc` and calls them, so a local `npm run verify` and CI run the same gate.

## Dependency and action updates

Every action in `.github/workflows/` is pinned by its full commit SHA, with the release tag as a comment (`uses: actions/checkout@<sha> # v7.0.1`). A tag can be moved after the fact; a SHA cannot. Never write `@v7` in a workflow.

`.github/dependabot.yml` runs weekly and keeps both the pins and `package.json` current:

- **npm:** one pull request for dev tooling (minor and patch), one for runtime dependencies (minor and patch). Each major comes as its own pull request. Commits start with `build:`.
- **github-actions:** one pull request for minor and patch updates. Each major comes on its own. Commits start with `ci:`. Dependabot rewrites the SHA and the tag comment together.
- At most three npm and two action pull requests are open at a time.

How to treat these pull requests:

- The gate decides. If `CI / verify` is green, a minor or patch update can be merged. If it is red, fix it or close the pull request.
- A major update needs a look first. Read the changelog and [ADR 0001](../adr/0001-dependency-baseline.md), which says why versions are exact and why three `overrides` exist.
- Dependabot does not touch `overrides`. When an update makes an override unnecessary, remove it by hand (see ADR 0001), then run `npm run verify`.
- Do not merge a change to a workflow pin that lacks the tag comment.
- **Action updates, the owner's standing rule (2026-11-21):** an agent may merge a Dependabot action update, major or not, after three checks. First, read the action's changes between the old and the new tag (its `action.yml`, README and changelog at both tags) against the inputs and behaviour our workflows rely on. Second, verify the new SHA against its tag with `git ls-remote https://github.com/<owner>/<action> refs/tags/<tag>`. Third, see CI green on the pull request. Anything doubtful goes to the owner. `release.yml` and `nightly-mutation.yml` do not run on a pull request, so say in the report what in them depends on the action.
- **Majors held back** by ADR 0001 (TypeScript 7, ESLint 10, `@eslint/js` 10) are on Dependabot's `ignore` list. Remove an entry when its blocker is gone.

## Steps for you

1. **Allow Actions.** *Settings → Actions → General*: allow actions and reusable workflows (at least the `actions/*` ones). Under *Workflow permissions*, the default read-only token is enough; `release.yml` asks for `contents: write`, `id-token: write` and `attestations: write` itself. Artifact attestations need a public repository, or GitHub Enterprise Cloud for a private one.
2. **Protect `main`.** *Settings → Rules → Rulesets → New branch ruleset* for `main`:
   - require a pull request before merging, with at least one approval;
   - require status checks to pass, and add **`CI / verify`** (it appears after the workflow has run once);
   - add **`CI / e2e`** too, once they have run without a flake for about two weeks; until then they report but do not block;
   - block force pushes;
   - allow only squash merges (*Settings → General → Pull Requests*).
3. **Prove the rule.** Open a pull request containing a planted type error (for example `const x: number = "a";` in `src/domain/shell/settings.ts`). The `verify` check must fail and the merge button must stay blocked. Close the PR without merging.
4. **First release.** See [releasing.md](releasing.md). The first tag also shows whether the `release` workflow may create releases in your repository.

## Distribution

The GitHub release carries the three files Obsidian installs. Listing in Obsidian's community plugin directory is a separate submission and out of scope. Until then, install by copying the release files to `<vault>/.obsidian/plugins/weg-manager/`, or through BRAT (see [releasing.md](releasing.md#beta-testing-with-brat)).
