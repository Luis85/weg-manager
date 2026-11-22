# Task 00 · Repository skeleton and identity

Phase A. Needs: this folder at `docs/plans/obsidian-plugin-shell-blueprint/` in an otherwise empty folder, and the [inputs](README.md#inputs), answered or defaulted.

**Goal.** A git repository with the plugin's identity, the files every tool reads from the root, and this blueprint committed beside them.

## Files

Create: `manifest.json`, `versions.json`, `package.json`, `.npmrc`, `.nvmrc`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.env.local.example`, `LICENSE`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `GLOSSARY.md`. Commit: `docs/plans/obsidian-plugin-shell-blueprint/` as copied. `docs/adr/` starts with ADR 0001 in Task 01 and `docs/engineering/` with Task 21 (git keeps no empty folder).

## Steps

- [ ] **1. Init.** `git init -b main` in the folder that holds `docs/plans/obsidian-plugin-shell-blueprint/`.
- [ ] **2. `manifest.json`.** `id: "<plugin-id>"`, `name: "<Plugin Name>"`, `version: "0.1.0"`, `minAppVersion: "<min-app-version>"`, `description` (one English sentence; it is the community listing text), `author: "<author>"`, `isDesktopOnly: true`. Key order as written; two-space JSON with a final newline. When `<min-app-version>` was not given, take the newest stable Obsidian app: `node -e "fetch('https://raw.githubusercontent.com/obsidianmd/obsidian-releases/HEAD/desktop-releases.json').then(r=>r.json()).then(j=>console.log(j.latestVersion))"` prints it (`1.15.1` on 2026-11-22). Task 01 checks it against the published `obsidian` types.
- [ ] **3. `versions.json`.** `{ "0.1.0": "<min-app-version>" }`.
- [ ] **4. `package.json`.** `name: "<plugin-id>"`, `version: "0.1.0"`, `private: true`, `type: "module"`, the same `description`, `license`, `engines: { "node": ">=24" }`, `scripts: {}`. No dependencies yet: each package enters in the task that first uses it (Task 01 explains why).
- [ ] **5. `.npmrc`.** Three lines: `save-exact=true`, `engine-strict=true`, `tag-version-prefix=""`. The last makes `npm version` tag `0.2.0`, not `v0.2.0`; the release workflow (Task 21) triggers on bare `x.y.z` tags only.
- [ ] **6. `.nvmrc`.** `24`.
- [ ] **7. `.gitignore`.** At least: `node_modules/`, `dist/` (also covers `tests/e2e/probe-plugin/dist/`), `release/`, `reports/`, `.stryker-tmp/`, `.env.local`, `.obsidian-cache` (no slash: in a worktree it may be a symlink), `tests/e2e/vaults/reference/`, `.claude/worktrees/`, `.fallow/`, `.obsidian`, `.probe/` (Task 01's scratch folder). Coverage goes to `reports/coverage/`, so no `coverage/` entry is needed.
- [ ] **8. `.gitattributes`.** `* text=auto eol=lf`, and `binary` for `*.png`, `*.jpg`, `*.zip`.
- [ ] **9. `.editorconfig`.** `root = true`; for `[*]`: `charset = utf-8`, `end_of_line = lf`, `insert_final_newline = true`, `indent_style = space`, `indent_size = 2`, `trim_trailing_whitespace = true`; for `[*.md]`: `trim_trailing_whitespace = false`.
- [ ] **10. `.env.local.example`.** One line, `OBSIDIAN_PLUGIN_DIR=`. Task 08's `npm run dev` reads `.env.local`.
- [ ] **11. `LICENSE`.** The `<license>` text with the year and `<author>`. `eslint-plugin-obsidianmd` checks `LICENSE` and `manifest.json` from Task 02 on.
- [ ] **12. `README.md`.** Title, one paragraph saying what the plugin is, an *Installation* section (copy `main.js`, `manifest.json`, `styles.css` into `<vault>/.obsidian/plugins/<plugin-id>/`; BRAT for testers, Task 21) and a *Development* section that Task 22 completes.
- [ ] **13. `AGENTS.md` and `CLAUDE.md`.** `CLAUDE.md` is the single line `@AGENTS.md`. `AGENTS.md` starts with the gate rule (`npm run verify` must exit 0; read the exit code), tests first, and the line "The repository is built by the plan in `docs/plans/obsidian-plugin-shell-blueprint/README.md`; run its tasks in order." Task 22 rewrites it from the code.
- [ ] **14. `GLOSSARY.md`.** A table *product term → English code term*, empty except for the tracer's terms (`item`, `title`, `status`, `due`, or the plugin's real ones). A term enters the glossary before it enters code (global constraint 13).

## Checks

- `node --input-type=module -e "import{readFileSync as r}from'node:fs';const m=JSON.parse(r('manifest.json','utf8'));if(!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(m.id)||m.id.includes('obsidian'))process.exit(1)"` exits 0.
- `node -e "const p=require('./package.json');process.exit(p.type==='module'&&p.private?0:1)"` exits 0.

## Done when

Both checks exit 0 and `git status` shows only the files above and the blueprint folder. Commit `chore: repository skeleton`.
