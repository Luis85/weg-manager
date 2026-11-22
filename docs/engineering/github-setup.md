# GitHub setup

The repository's CI runs on GitHub Actions (decided 2026-11-21, replacing the Azure Pipelines of the [archived blueprint](../plans/archive/obsidian-plugin-shell-blueprint.md)). The workflows are committed; the steps below change repository settings and are yours to do. An agent must not perform them.

## Workflows

| File | Trigger | What it does |
| --- | --- | --- |
| `.github/workflows/ci.yml` | push to `main`, every pull request (a newer push cancels an older run of the same pull request only, never one on `main`) | job `verify`: `npm ci`, `npm run verify`; uploads `reports` (JUnit, Cobertura) even on failure and `plugin` (`dist/`) on success; then `npm run lint:scanner` as its last step, informational (`continue-on-error`, so it never fails the job; a failure adds a warning annotation; see [testing.md](testing.md#scanner-equivalent-lint)). Job `e2e`: `npm run test:e2e` in the latest real Obsidian under `xvfb-run`, with Obsidian restored from and saved to the Actions cache (see [The e2e display and the Obsidian cache](#the-e2e-display-and-the-obsidian-cache)). `npm ci` runs in `verify` and in `e2e` only, twice per run. Job `skills`: the Python tests in `skills/tests/` and `python3 skills/package_claude_skills.py`; uploads `claude-skills` (the skill ZIP) |
| `.github/workflows/nightly-mutation.yml` | nightly 02:17 UTC on the default branch, or by hand (input `full`) | `npm run test:mutation` (incremental; `test:mutation:full` when `full` is set), with `reports/stryker-incremental.json` restored and saved through `actions/cache` (key: Stryker config + lockfile + run id, restore-keys: the same without the run id); uploads `reports/mutation/`. Job `mutation-edge` (not gating, no score threshold): `npm run test:mutation:edge` (`-- --force` when `full` is set) over the edge layers, with `reports/stryker-edge-incremental.json` cached the same way under its own key and `reports/mutation-edge/` uploaded as `mutation-edge-report`. Job `report-failure` (`issues: write` only) opens the issue "Nightly mutation run failed" or comments on the open one, with a link to the run |
| `.github/workflows/release.yml` | by hand on `main` with the input `version` (the way for an agent; the workflow creates the tag), or a pushed tag `x.y.z` (no `v`) | job `build` (read-only): resolves the version, the commit must be on `main`, `npm run verify`, the e2e suite (display and Obsidian cache as in `ci.yml`), `npm run release:package -- --tag x.y.z`, upload of `release/` (the plugin folder and `THIRD-PARTY-NOTICES.txt`). Job `release` (write permissions, no checkout, no `npm`): download, build-provenance attestation (`actions/attest`) of the four assets, GitHub release with `main.js`, `manifest.json`, `styles.css` and `THIRD-PARTY-NOTICES.txt`, as a pre-release while the major version is 0. See [releasing.md](releasing.md) |

All logic lives in npm scripts. The YAML only installs Node from `.nvmrc` and calls them, so a local `npm run verify` and CI run the same gate (the pre-push hook runs it too, except for a push of documents only, see [testing.md](testing.md#gate-and-pre-push-hook)). The exceptions are the release job's steps, which cannot call a script because that job has no checkout (the tag-on-main check, the pre-release flag), and the failure issue of the nightly run.

`release.yml` and `nightly-mutation.yml` can only run on the Actions runner. What has run so far (2026-11-22):

- `release.yml`, started by hand with `version` 0.2.0: both jobs passed on the first run; the release has the four assets, is a pre-release, and the attestation step passed. The start by a pushed tag has not run yet.
- `nightly-mutation.yml`: the first scheduled run (before the edge job existed) passed in 32 minutes. A run started by hand after the 0.2.0 version bump tested every mutant, because the lockfile is part of the cache key: the job `mutation-edge` passed in 39 minutes and saved its results; the job `mutation` was cut off by its 45-minute limit without a report, and no issue was opened, because a job cut off by its limit ends as "cancelled". Both are fixed: the limit is 120 minutes, and `report-failure` reads the jobs' results. Not shown yet: a second run that restores the first run's results, and the failure issue itself.

## The e2e display and the Obsidian cache

Both belong to the `e2e` job of `ci.yml` and to the e2e steps of `release.yml`'s `build` job, which are the same steps. Both changed on 2026-11-22 (PBI-64).

- **Display.** The job runs `xvfb-run -a -s "-screen 0 1280x1024x24 +extension GLX -noreset" npm run test:e2e`. `ubuntu-latest` has `xvfb-run` on Ubuntu 24.04 and 26.04, so nothing is installed per run: the `apt-get install herbstluftwm` of before (about 21 s, and a network dependency) is gone.
- **No window manager.** The sample workflow of `wdio-obsidian-service` starts `herbstluftwm`, and its changelog (2.0.0) says it was added "to fix some intermittent failures that only occurred in the CI tests" ([Testing research](../design/research/Testing%20research%20-%20Obsidian%20end-to-end%20tests.md)). An unmanaged window draws later on the runner: the first attempt without it (2026-11-22) failed one check, because `appearance.e2e.ts` read the delete dialog's colours 400 ms after a theme change, before the change had been drawn (the run's `appearance-contrast.json` showed the dialog's texts still at their light values). Since then no spec waits a fixed time for an effect, and colour measurements finish running fades before they read (PBI-63, criteria 6 to 8), so the attempt was repeated. What to watch for: a failure in the e2e job that reads something too early (colours, focus, a pop-out) and passes locally. Find the missing wait first; a spec that needs a managed window to pass is hiding a race. If the job stays unreliable all the same, put the window manager back: `sudo apt-get update -q && sudo apt-get install -q -y herbstluftwm`, then `Xvfb :99 -screen 0 1280x1024x24 +extension GLX -noreset &`, `DISPLAY=:99 herbstluftwm &`, `echo "DISPLAY=:99" >> "$GITHUB_ENV"` and plain `npm run test:e2e` (the steps are in the history of `ci.yml` before this change).
- **Obsidian cache.** The key is `obsidian-cache-<os>-<hash of the resolved versions>`: the lock file names the concrete app and installer version that `latest/latest` resolves to, so a new Obsidian release makes a new entry. The entry holds the app, the installer and the matching chromedriver, about 1.3 GB unpacked. There is no `restore-keys`: a run restores the current entry or nothing, so an old version is never carried into a new entry and the entries do not grow. **Kept: the current entry, plus the previous one until GitHub evicts it** (an entry that nobody restored for seven days goes, and above the repository's 10 GB the least recently used goes first), so two entries, about 2.6 GB unpacked, in the 10 GB. The npm caches (`setup-node` with `cache: npm`) are small beside that, but they are what a full cache pushes out first, which is why the count is written down. An entry saved by a pull request run is visible to that pull request only; one saved on `main` is visible to all. The push to `main` after a merge runs the job, so `main` has the current entry soon after a new Obsidian release, but the first pull requests after a release may each hold a copy until then.
- **A failed first run does not download again.** The cache is restored with `actions/cache/restore` and saved with `actions/cache/save` after the tests, `if: always()`, so a run whose tests fail still keeps its download for the retry (as `nightly-mutation.yml` does for its incremental file). Two guards: a hit is not saved again (an entry never changes), and nothing is saved unless the app, the installer and the chromedriver folders are all complete, because a half-filled entry would be restored by every later run and could not be replaced. `obsidian-launcher` fills each folder through a temporary one and a rename, so a download that stops leaves no incomplete folder, only a hidden temporary one the check ignores.

## Dependency and action updates

Every action in `.github/workflows/` is pinned by its full commit SHA, with the release tag as a comment (`uses: actions/checkout@<sha> # v7.0.1`). A tag can be moved after the fact; a SHA cannot. Never write `@v7` in a workflow.

`.github/dependabot.yml` runs weekly and keeps both the pins and `package.json` current:

- **npm:** one pull request for the `@wdio/*` packages (every update type, a major too, because they are released together), one for the other dev tooling (minor and patch), one for runtime dependencies (minor and patch). Each other major comes as its own pull request. Commits start with `build:`.
- **Cooldown:** both ecosystems wait seven days after a release before proposing it (`cooldown.default-days: 7`; the semver-specific keys exist for npm only). Security updates ignore it.
- **github-actions:** one pull request for minor and patch updates. Each major comes on its own. Commits start with `ci:`. Dependabot rewrites the SHA and the tag comment together.
- At most three npm and two action pull requests are open at a time.

How to treat these pull requests:

- The gate decides. If `CI / verify` is green, a minor or patch update can be merged. If it is red, fix it or close the pull request.
- A major update needs a look first. Read the changelog and [ADR 0001](../adr/0001-dependency-baseline.md), which says why versions are exact and why three `overrides` exist.
- Dependabot does not touch `overrides`. When an update makes an override unnecessary, remove it by hand (see ADR 0001), then run `npm run verify`.
- Do not merge a change to a workflow pin that lacks the tag comment.
- **Action updates, the owner's standing rule (2026-11-21):** an agent may merge a Dependabot action update, major or not, after three checks. First, read the action's changes between the old and the new tag (its `action.yml`, README and changelog at both tags) against the inputs and behaviour our workflows rely on. Second, verify the new SHA against its tag with `git ls-remote https://github.com/<owner>/<action> refs/tags/<tag>`. Third, see CI green on the pull request. Anything doubtful goes to the owner. `release.yml` and `nightly-mutation.yml` do not run on a pull request, so say in the report what in them depends on the action.
- **Third-party notices on an update, the owner's standing rule (2026-11-22):** when an update adds or removes a bundled package, `check:notices` turns the pull request red. An agent may push one commit with the regenerated `THIRD-PARTY-NOTICES.txt` (`npm run notices`) onto the Dependabot branch, names the licence of every new package in its review, and merges when CI is green. A new licence that is not MIT, ISC, BSD or Apache goes to the owner first.
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

The GitHub release carries the three files Obsidian installs and, as a fourth asset, `THIRD-PARTY-NOTICES.txt` (see [releasing.md](releasing.md#third-party-notices)). Listing in Obsidian's community plugin directory is a separate submission and out of scope. Until then, install by copying the release files to `<vault>/.obsidian/plugins/weg-manager/`, or through BRAT (see [releasing.md](releasing.md#beta-testing-with-brat)).
