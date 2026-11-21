# ADR 0009 · Skill tooling in TypeScript

- Status: accepted
- Date: 2026-11-21

## Context

The Claude skill `weg-gmail-to-vault` (PBI-46, K-16) shipped with a Python note writer (`scripts/import_messages.py`), a Python packaging script and Python unit tests. Everything else in the repository is TypeScript on Node 24 with one quality gate (`npm run verify`). Python stood outside that gate: Prettier, ESLint, oxlint, fallow and the type checker skipped `skills/`, and CI needed a separate Python setup. The owner decided to have one language across the codebase.

The writer runs inside the user's Claude session, not in the repository. It must stay a single file with no installed packages, and it must keep writing notes that the Python version would recognise: same file names, same `id`, same `source_content_sha256`, same frontmatter format. Otherwise messages imported earlier would show up as `source_changed` or as duplicates.

## Decision

- **Sources in TypeScript.** The writer lives in `skills/src/gmail/` (`json`, `normalize`, `vault`, `note`, `import`, `cli`), the packager in `skills/src/package-skills.ts` with a stored-ZIP writer in `skills/src/zip.ts`. They use only `node:` built-ins; the packager also uses Vite.
- **One generated file in the skill.** `npm run skills:package` bundles the writer with Vite (SSR build, target `node20`, not minified) into `skills/weg-gmail-to-vault/scripts/import-messages.mjs`, writes the ZIP to `skills/dist/` and refreshes `skills/manifest.json`. The generated file is committed, so the skill folder can still be copied as it is; a test and the CI job `skills` fail when it no longer matches its source.
- **Runtime: Node.js 20 or newer** in the Claude session instead of Python 3.10. The manifest's `capabilities_required` says `node-20-or-newer`; the skill version is 0.2.0.
- **Python-compatible output.** `pyJson` reproduces `json.dumps` with Python's separators and `sort_keys`, `timestamp` reproduces `fromisoformat(...).isoformat()`, and the vault scan reads frontmatter as the Python writer did (BOM, CRLF, quoted keys, comments). A comparison run on the same input gave identical reports, file names, ids and hashes. One deliberate difference: a subject of only whitespace now gets the heading "Ohne Betreff" instead of an empty one; id and hash are unaffected.
- **No replacing of existing files on any platform.** Notes are published with an exclusive hard link from a temporary file; where the file system has no hard links, an exclusive copy (`COPYFILE_EXCL`) is used. The Python version renamed on Windows instead.
- **Same gate as the plugin.** `skills/src` and `skills/tests` are formatted by Prettier, linted by ESLint and oxlint, type-checked through `configs/tsconfig.node.json`, analysed by fallow and tested by Vitest (project `skills`) within `npm run verify`. The generated skill folder and the manifest stay excluded.

## Consequences

- Claude sessions without Node.js 20 cannot run the writer. Whether a given Claude surface provides it is part of the pending live test (PBI-46); until then the skill tells Claude to report a missing runtime instead of claiming an import. Python was not guaranteed either, so the requirement changes, not its kind.
- A change to the writer means: edit `skills/src/gmail/*.ts`, run `npm run skills:package`, commit the regenerated `import-messages.mjs` and `manifest.json` together with the source.
- The writer has no coverage threshold of its own; `test:coverage` measures `src/` only. The 58 skill tests cover the former Python tests and add validation, command-line and packaging cases.
- Notes written by version 0.1.0 remain valid input; there is no migration.
