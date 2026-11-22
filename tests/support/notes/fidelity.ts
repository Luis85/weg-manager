import { eitherOrder } from "./event-order";

/**
 * What real Obsidian 1.15.1 does, as data shared by the e2e spec (which checks it against the real
 * app, `tests/e2e/specs/note-store.e2e.ts`) and the unit tests (which check the double and the
 * in-memory adapter against it). A change here is a finding about Obsidian, not a test tweak.
 */

/** `normalizePath(input)` → output. */
export const NORMALIZE_CASES: readonly (readonly [string, string])[] = [
  ["/a//b/", "a/b"],
  ["a\\b", "a/b"],
  ["", "/"],
  ["/", "/"],
  [" a/b ", " a/b "],
  ["a/./b", "a/./b"],
  ["WEG Manager//Gemeinschaften/", "WEG Manager/Gemeinschaften"],
  ["x y z", "x y z"],
  ["é", "é"],
];

/**
 * `stringifyYaml(value)` → text, for the kinds of value a record holds. The keys are sorted
 * because `executeObsidian` sorts the keys of what it passes in.
 */
export const STRINGIFY_SAMPLE = {
  value: {
    active: true,
    blank: "",
    colon: "a: b",
    count: 3,
    date: "2026-01-01",
    empty: [],
    name: "Ahornweg 12",
    none: null,
    number: "42",
    schema: "weg-manager.community/v1",
    share: 1.5,
    tags: ["a", "b c"],
    word: "yes",
  },
  text: 'active: true\nblank: ""\ncolon: "a: b"\ncount: 3\ndate: 2026-01-01\nempty: []\nname: Ahornweg 12\nnone:\nnumber: "42"\nschema: weg-manager.community/v1\nshare: 1.5\ntags:\n  - a\n  - b c\nword: yes\n',
};

/** `parseYaml(text)` → value: YAML 1.2 core schema. */
export const PARSE_SAMPLE = {
  text: "d: 2026-01-01\nn:\nt: ~\nb: True\nq: 'x'\nl: [a, b, 1]\ni: 012\nf: .5\nh: 0x10\ns: \"a: b\"\n",
  value: {
    d: "2026-01-01",
    n: null,
    t: null,
    b: true,
    q: "x",
    l: ["a", "b", 1],
    i: 12,
    f: 0.5,
    h: 16,
    s: "a: b",
  },
};

/**
 * Candidate closing lines of a frontmatter block, each on line 2 of `---`, `a: 1`, the candidate,
 * `b: 2`, `---`, a body: `vaultFacts` records where the metadata cache closes the block.
 */
export const CLOSING_LINES: readonly string[] = [
  "---",
  "--- ",
  "---\t",
  "---  \t ",
  "----",
  "---- ",
  "-----",
  "--- x",
  "---x",
  "--- # c",
  " ---",
  "...",
];

/** The texts of `CLOSING_LINES`, and one with CRLF line breaks. */
export const CLOSING_TEXTS: readonly string[] = [
  ...CLOSING_LINES.map((closing) => `---\na: 1\n${closing}\nb: 2\n---\nbody\n`),
  "---\r\na: 1\r\n--- \r\nb: 2\r\n---\r\nbody\r\n",
];

/**
 * The report of `vaultFacts` (`scenarios.ts`): each step's result and the events it fired, in
 * order up to its fence; `done` is where the call's promise settled. Measured in Obsidian 1.15.1
 * over eight runs, three on an idle machine and five beside eight busy processes: the vault's own
 * events fire before the promise settles, the metadata cache's `changed` after it.
 */
export const VAULT_FACTS = {
  normalized: NORMALIZE_CASES.map(([, output]) => output),
  stringified: STRINGIFY_SAMPLE.text,
  parsed: PARSE_SAMPLE.value,
  createInMissingFolder: { result: "Error: ENOENT", events: ["done"] },
  // Parents first, each before the promise settles.
  createFolders: {
    result: "A/B/C",
    events: ["vault:create A", "vault:create A/B", "vault:create A/B/C", "done"],
  },
  createFolderAgain: { result: "Error: Folder already exists.", events: ["done"] },
  // The cache has nothing yet when `create` resolves; `changed` follows a moment later.
  create: {
    result: null,
    events: ["vault:create A/n.md", "done", "metadataCache:changed A/n.md"],
  },
  createAgain: { result: "Error: File already exists.", events: ["done"] },
  cacheAfterCreate: { a: 1, b: 2 },
  children: ["A/B", "A/n.md"],
  rootChildren: true,
  lookupInOtherCase: null,
  processUnchanged: { result: "---\na: 1\nb: 2\n---\nbody\n", events: ["done"] },
  frontmatterUnchanged: { events: ["done"] },
  frontmatterThrows: { result: "Error: stop", events: ["done"] },
  // Right after `processFrontMatter` the cache still holds the old frontmatter.
  frontmatterChanged: {
    result: { a: 1, b: 2 },
    events: ["vault:modify A/n.md", "done", "metadataCache:changed A/n.md"],
  },
  textAfterChange: "---\na: 5\nb: 2\nc:\n  - x\n---\nbody\n",
  createPlain: {
    events: ["vault:create A/plain.md", "done", "metadataCache:changed A/plain.md"],
  },
  // These two steps read the file after the write, and whether that read or the index of the
  // write comes first varies (four runs of eight each way for `plain`).
  plain: {
    result: "---\nk: v\n---\n# Plain\n",
    events: ["vault:modify A/plain.md", eitherOrder("metadataCache:changed A/plain.md", "done")],
  },
  allKeysDeleted: {
    result: "# Plain\n",
    events: ["vault:modify A/plain.md", eitherOrder("metadataCache:changed A/plain.md", "done")],
  },
  createBroken: {
    events: ["vault:create A/broken.md", "done", "metadataCache:changed A/broken.md"],
  },
  brokenCache: { position: false },
  createEmptyBlock: {
    events: ["vault:create A/empty.md", "done", "metadataCache:changed A/empty.md"],
  },
  blocks: [
    { path: "A/broken.md", frontmatter: false, yaml: [0, 2] },
    { path: "A/empty.md", frontmatter: false, yaml: [0, 1] },
    { path: "A/n.md", frontmatter: true, yaml: [0, 5] },
    { path: "A/plain.md", frontmatter: false, yaml: null },
  ],
  brokenYaml: { result: "YAMLParseError", events: ["done"] },
  createClosings: CLOSING_TEXTS.length,
  // Measured in Obsidian 1.15.1: every line that starts with `---` closes the block, whatever
  // follows (`----`, `--- x`, `---x`), with LF or CRLF; ` ---` and `...` do not. Up to line 4,
  // ` ---` continues `a: 1` as text, while `...` ends the YAML document and the rest is an error.
  closings: [...CLOSING_LINES.slice(0, 10).map(() => [2, true]), [4, true], [4, false], [2, true]],
  createBom: { events: ["vault:create A/bom.md", "done", "metadataCache:changed A/bom.md"] },
  bomCache: { a: 1 },
  bomRead: "---\r",
  processBom: {
    result: ["﻿---\r\na: 1\r\n---\r\nbody\r\n", "﻿---\r\na: 2\r\n---\r\nbody\r\n"],
    events: ["vault:modify A/bom.md", "done", "metadataCache:changed A/bom.md"],
  },
  // What the callback throws comes out unchanged.
  processThrows: { result: "TypeError", events: ["done"] },
  createGone: { events: ["vault:create A/gone.md", "done", "metadataCache:changed A/gone.md"] },
  processGone: {
    result: { rejected: "ENOENT", called: false },
    events: ["metadataCache:deleted A/gone.md", "vault:delete A/gone.md", "done"],
  },
  renameOntoFile: { result: "Error: Destination file already exists!", events: ["done"] },
  renameIntoMissingFolder: { result: "Error: ENOENT", events: ["done"] },
  rename: {
    result: { same: true, path: "A/B/moved.md" },
    events: ["vault:rename A/plain.md -> A/B/moved.md", "done"],
  },
  // `trashFile` resolves with `true`, although the d.ts says `Promise<void>`.
  trashFile: {
    result: true,
    events: ["metadataCache:deleted A/n.md", "vault:delete A/n.md", "done"],
  },
  // The folder's contents in the vault's order (`moved.md` joined it last), the folder last.
  trashFolder: {
    events: [
      "vault:delete A/B/C",
      "metadataCache:deleted A/B/moved.md",
      "vault:delete A/B/moved.md",
      "vault:delete A/B",
      "done",
    ],
  },
};
