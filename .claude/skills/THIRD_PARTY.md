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

`archify` is **not in the repository** (owner decision, 23.11.2026). The community directory's source scan reads the whole repository, has no ignore option, and flags Archify's files (`explainer/reader.js` assigns `innerHTML`; `explainer/reader.css` fails its CSS lint). So `.claude/skills/archify/` is git-ignored, and **every collaborator installs it themselves**, into the location Archify documents for Claude Code:

```bash
git clone https://github.com/tt-a1i/archify /tmp/archify
git -C /tmp/archify checkout 8509a3d
cp -R /tmp/archify/archify .claude/skills/archify
rm -f .claude/skills/archify/examples/*.html
node .claude/skills/archify/bin/archify.mjs doctor
```

The version this project was set up with is skill version 3.2.0, commit `8509a3d`; `doctor` reports "Archify is ready". The 15 pre-rendered demo pages `examples/*.html` (about 13 MB) are not needed: the skill uses only the `examples/*.json` sources. A cloud session gets Archify only through its environment's setup script, which can run the same commands.

- Needs Node 18+, no npm install.
- In this project, diagrams go to `docs/archify/<type>-<slug>-<timestamp>/` instead of Archify's default `.archify/`. `AGENTS.md` sets this; the skill itself is unchanged. Archify's temporary `.archify-*` files and its delivery and finalize receipts there (absolute local paths and hashes) are git-ignored; the candidate and the HTML are what gets committed.
- During delivery, Archify can check online for a newer stable release and show a reminder. It never updates itself.
- To update: install a newer upstream `archify/` the same way, run `doctor`, and adjust the version and commit above.
- Archify is licensed under the Apache License 2.0 (with `LICENSE`, `NOTICE` and `THIRD_PARTY_NOTICES.md` in the installed folder, plus `LICENSE-MIT`). Since the repository no longer ships it, it carries none of these files.

