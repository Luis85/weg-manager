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

/** The report of `vaultFacts` (`scenarios.ts`): each step's result and the events it fired. */
export const VAULT_FACTS = {
  normalized: NORMALIZE_CASES.map(([, output]) => output),
  stringified: STRINGIFY_SAMPLE.text,
  parsed: PARSE_SAMPLE.value,
  createInMissingFolder: { result: "Error: ENOENT", events: [] },
  createFolders: {
    result: "A/B/C",
    events: ["vault:create A", "vault:create A/B", "vault:create A/B/C"],
  },
  createFolderAgain: { result: "Error: Folder already exists.", events: [] },
  // The cache has nothing yet when `create` resolves; `changed` follows a moment later.
  create: { result: null, events: ["vault:create A/n.md", "metadataCache:changed A/n.md"] },
  createAgain: { result: "Error: File already exists.", events: [] },
  cacheAfterCreate: { a: 1, b: 2 },
  processUnchanged: { result: "---\na: 1\nb: 2\n---\nbody\n", events: [] },
  frontmatterUnchanged: { events: [] },
  frontmatterThrows: { result: "Error: stop", events: [] },
  // Right after `processFrontMatter` the cache still holds the old frontmatter.
  frontmatterChanged: {
    result: { a: 1, b: 2 },
    events: ["vault:modify A/n.md", "metadataCache:changed A/n.md"],
  },
  textAfterChange: "---\na: 5\nb: 2\nc:\n  - x\n---\nbody\n",
  createPlain: { events: ["vault:create A/plain.md", "metadataCache:changed A/plain.md"] },
  plain: {
    result: "---\nk: v\n---\n# Plain\n",
    events: ["vault:modify A/plain.md", "metadataCache:changed A/plain.md"],
  },
  allKeysDeleted: {
    result: "# Plain\n",
    events: ["vault:modify A/plain.md", "metadataCache:changed A/plain.md"],
  },
  createBroken: { events: ["vault:create A/broken.md", "metadataCache:changed A/broken.md"] },
  brokenCache: { position: false },
  brokenYaml: { result: "YAMLParseError", events: [] },
  renameOntoFile: { result: "Error: Destination file already exists!", events: [] },
  renameIntoMissingFolder: { result: "Error: ENOENT", events: [] },
  rename: {
    result: { same: true, path: "A/B/moved.md" },
    events: ["vault:rename A/plain.md -> A/B/moved.md"],
  },
  // `trashFile` resolves with `true`, although the d.ts says `Promise<void>`.
  trashFile: { result: true, events: ["metadataCache:deleted A/n.md", "vault:delete A/n.md"] },
  trashFolder: {
    events: [
      "vault:delete A/B/C",
      "metadataCache:deleted A/B/moved.md",
      "vault:delete A/B/moved.md",
      "vault:delete A/B",
    ],
  },
};

const COMMUNITY = { schema: "weg-manager.community/v1", name: "Ahornweg 12", tags: ["a", "b"] };
const FIRST = "WEG Manager/Gemeinschaften/Ahornweg.md";
const SECOND = "WEG Manager/Gemeinschaften/Ahornweg (2).md";
const OUTSIDE = {
  schema: "weg-manager.community/v1",
  zeta: 1,
  name: "Alt",
  unknown: "kept",
  gone: true,
};
const UPDATED = {
  schema: "weg-manager.community/v1",
  zeta: 1,
  name: "Neu",
  unknown: "kept",
  added: "x",
};
const UPDATED_TEXT =
  "---\nschema: weg-manager.community/v1\nzeta: 1\nname: Neu\nunknown: kept\nadded: x\n---\n# Fremd\n\nText bleibt.\n";

/** The report of `storeScenario` (`scenarios.ts`): the store's results and the events fired. */
export const STORE_REPORT = {
  create: {
    result: { ok: true, value: { path: FIRST, frontmatter: COMMUNITY } },
    events: [
      "vault:create WEG Manager",
      "vault:create WEG Manager/Gemeinschaften",
      `vault:create ${FIRST}`,
      `metadataCache:changed ${FIRST}`,
    ],
  },
  createdText:
    "---\nschema: weg-manager.community/v1\nname: Ahornweg 12\ntags:\n  - a\n  - b\n---\n# Ahornweg\n",
  clash: {
    result: { ok: true, value: { path: SECOND, frontmatter: COMMUNITY } },
    events: [`vault:create ${SECOND}`, `metadataCache:changed ${SECOND}`],
  },
  // Recognised by `schema` anywhere; `Ohne Schema.md` and `Kaputt.md` are not records.
  list: {
    result: {
      ok: true,
      value: [
        { path: "Archiv/Fremd.md", frontmatter: OUTSIDE },
        { path: SECOND, frontmatter: COMMUNITY },
        { path: FIRST, frontmatter: COMMUNITY },
      ],
    },
    events: [],
  },
  update: {
    result: { ok: true, value: { path: "Archiv/Fremd.md", frontmatter: UPDATED } },
    events: ["vault:modify Archiv/Fremd.md", "metadataCache:changed Archiv/Fremd.md"],
  },
  // Key order, the unknown key and the body survive.
  updatedText: UPDATED_TEXT,
  // A patch that changes nothing writes nothing.
  unchanged: {
    result: { ok: true, value: { path: "Archiv/Fremd.md", frontmatter: UPDATED } },
    events: [],
  },
  refused: { result: { ok: false, tag: "Conflict" }, events: [] },
  broken: { result: { ok: false, tag: "NoteUnreadableError" }, events: [] },
  rename: {
    result: { ok: true, value: { path: "Archiv/Umbenannt.md", frontmatter: UPDATED } },
    events: ["vault:rename Archiv/Fremd.md -> Archiv/Umbenannt.md"],
  },
  renamedText: UPDATED_TEXT,
  renameTaken: { result: { ok: false, tag: "NotePathTakenError" }, events: [] },
  trash: {
    result: { ok: true },
    events: [`metadataCache:deleted ${SECOND}`, `vault:delete ${SECOND}`],
  },
  readTrashed: { result: { ok: false, tag: "NoteNotFoundError" }, events: [] },
  finalList: {
    result: {
      ok: true,
      value: [
        { path: "Archiv/Umbenannt.md", frontmatter: UPDATED },
        { path: FIRST, frontmatter: COMMUNITY },
      ],
    },
    events: [],
  },
};
