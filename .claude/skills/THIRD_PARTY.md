# Third-party skills

## mattpocock/skills

The following skill folders are copied unchanged from [mattpocock/skills](https://github.com/mattpocock/skills), plugin `mattpocock-skills` version 1.3.1 (Claude plugin marketplace `claude-plugins-official`):

- Engineering: `ask-matt`, `code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`, `grill-with-docs`, `implement`, `implement-spec`, `improve-codebase-architecture`, `pr`, `prototype`, `research`, `retro`, `setup-matt-pocock-skills`, `tdd`, `to-spec`, `to-tickets`, `triage`, `wayfinder`, `wizard`
- Productivity: `grill-me`, `grilling`, `handoff`, `teach`, `to-questionnaire`, `wait-what`, `writing-for-agents`

Repo-specific configuration lives in `docs/agents/` and `AGENTS.md`, not in these folders. To update, replace the folders with a newer upstream version and adjust the version above.

`ambition-calibrator` is not part of this set.

### License

MIT License

Copyright (c) 2026 Matt Pocock

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## obsidianmd/obsidian-skills

The following skill folders are copied unchanged from [obsidianmd/obsidian-skills](https://github.com/obsidianmd/obsidian-skills) (`plugins/obsidian/skills/`), plugin `obsidian` version 1.2.1, commit `b110b2f`, the repository's documented "Manually → Claude Code" install:

- `obsidian-markdown`, `obsidian-bases`, `json-canvas`, `obsidian-cli`, `obsidian-headless`, `defuddle`, `knap`

`obsidian-cli` needs the Obsidian CLI (installer 1.12.7+, enabled in Obsidian's settings, app running). `defuddle`, `knap` and `obsidian-headless` need their own npm CLIs; the skills offer to install them and do not do it unasked. To update, replace the folders with a newer upstream version and adjust the version and commit above.

### License

MIT License

Copyright (c) 2026 Steph Ango (@kepano)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## tt-a1i/archify

`archify` is copied from [tt-a1i/archify](https://github.com/tt-a1i/archify) (folder `archify/`), skill version 3.2.0, commit `8509a3d`, the location Archify documents for Claude Code (`.claude/skills/`). The install was checked with `node .claude/skills/archify/bin/archify.mjs doctor` ("Archify is ready").

One deliberate change: the 15 pre-rendered demo pages `examples/*.html` (about 13 MB) are left out. The skill's instructions use only the `examples/*.json` sources, which are kept, and a demo can be rebuilt from its JSON. Everything else is unchanged.

- Needs Node 18+, no npm install.
- In this project, diagrams go to `docs/archify/<type>-<slug>-<timestamp>/` instead of Archify's default `.archify/`. `AGENTS.md` sets this; the skill itself is unchanged. Archify's temporary `.archify-*` files and its delivery and finalize receipts there (absolute local paths and hashes) are git-ignored; the candidate and the HTML are what gets committed.
- During delivery, Archify can check online for a newer stable release and show a reminder. It never updates itself.
- To update: replace the folder with a newer upstream `archify/` (again without `examples/*.html`, `explainer/reader.css` and `explainer/reader.js`), run `doctor`, and adjust the version and commit above.
- Since 23.11.2026 the explainer's reader, `explainer/reader.css` and `explainer/reader.js`, is not in the repository (owner decision): the community directory's source scan flags `reader.js` (`innerHTML`) and `reader.css` (CSS lint), and the scan has no ignore option. Both are git-ignored. Diagrams work without them; explainers need them. For explainers, copy both files from the upstream commit above into `.claude/skills/archify/explainer/`; `doctor` then reports "Archify is ready" again (without them it reports the explainer runtime as missing).

### License

Apache License 2.0; the full text is in `archify/LICENSE`, and `archify/NOTICE` and `archify/THIRD_PARTY_NOTICES.md` carry the required notices. The repository also ships `archify/LICENSE-MIT`.

