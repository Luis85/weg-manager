import { eitherOrder } from "./event-order";

/**
 * What the real Obsidian `NoteStore` adapter does in Obsidian 1.15.1, as the report of
 * `storeScenario` (`store-scenario.ts`): each call's result and the events it fired, in order up
 * to its fence, `done` where the call's promise settled. `note-store.e2e.ts` checks it in the app,
 * `obsidian-double.test.ts` on the double. A change here is a finding about Obsidian.
 */

const COMMUNITY = { schema: "weg-manager.community/v1", name: "Ahornweg 12", tags: ["a", "b"] };
const FIRST = "WEG Manager/Gemeinschaften/Ahornweg.md";
const SECOND = "WEG Manager/Gemeinschaften/Ahornweg (2).md";
const BY_CASE = "WEG Manager/Gemeinschaften/ahornweg (3).md";
const LINDE = "WEG Manager/Gemeinschaften/Linde.md";
const SOFORT = "WEG Manager/Gemeinschaften/Sofort.md";
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

/** A create's events: the note's `create` before the promise settles, its index after. */
const created = (path: string) => [`vault:create ${path}`, "done", `metadataCache:changed ${path}`];

export const STORE_REPORT = {
  create: {
    result: { ok: true, value: { path: FIRST, frontmatter: COMMUNITY } },
    events: [
      "vault:create WEG Manager",
      "vault:create WEG Manager/Gemeinschaften",
      ...created(FIRST),
    ],
  },
  createdText:
    "---\nschema: weg-manager.community/v1\nname: Ahornweg 12\ntags:\n  - a\n  - b\n---\n# Ahornweg\n",
  clash: {
    result: { ok: true, value: { path: SECOND, frontmatter: COMMUNITY } },
    events: created(SECOND),
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
    events: ["done"],
  },
  // Found by the `yaml` section the cache keeps for a block it could not read; in the folder only.
  unreadable: { result: { ok: true, value: ["Archiv/Kaputt.md"] }, events: ["done"] },
  // Names clash regardless of case: "ahornweg" and "ahornweg (2)" are taken.
  caseClash: {
    result: { ok: true, value: { path: BY_CASE, frontmatter: COMMUNITY } },
    events: created(BY_CASE),
  },
  update: {
    result: { ok: true, value: { path: "Archiv/Fremd.md", frontmatter: UPDATED } },
    events: ["vault:modify Archiv/Fremd.md", "done", "metadataCache:changed Archiv/Fremd.md"],
  },
  // Key order, the unknown key and the body survive.
  updatedText: UPDATED_TEXT,
  // A patch that changes nothing writes nothing.
  unchanged: {
    result: { ok: true, value: { path: "Archiv/Fremd.md", frontmatter: UPDATED } },
    events: ["done"],
  },
  refused: { result: { ok: false, tag: "Conflict" }, events: ["done"] },
  broken: { result: { ok: false, tag: "NoteUnreadableError" }, events: ["done"] },
  rename: {
    result: { ok: true, value: { path: "Archiv/Umbenannt.md", frontmatter: UPDATED } },
    events: ["vault:rename Archiv/Fremd.md -> Archiv/Umbenannt.md", "done"],
  },
  renamedText: UPDATED_TEXT,
  // A note may take its own name in another case.
  renameCase: {
    result: { ok: true, value: { path: "Archiv/UMBENANNT.md", frontmatter: UPDATED } },
    events: ["vault:rename Archiv/Umbenannt.md -> Archiv/UMBENANNT.md", "done"],
  },
  renameTaken: { result: { ok: false, tag: "NotePathTakenError" }, events: ["done"] },
  trash: {
    result: { ok: true },
    events: [`metadataCache:deleted ${SECOND}`, `vault:delete ${SECOND}`, "done"],
  },
  readTrashed: { result: { ok: false, tag: "NoteNotFoundError" }, events: ["done"] },
  finalList: {
    result: {
      ok: true,
      value: [
        { path: "Archiv/UMBENANNT.md", frontmatter: UPDATED },
        { path: FIRST, frontmatter: COMMUNITY },
        { path: BY_CASE, frontmatter: COMMUNITY },
      ],
    },
    events: ["done"],
  },
  // The root folder and its subfolder are found regardless of case, in the vault's spelling.
  caseFolder: {
    result: { ok: true, value: { path: LINDE, frontmatter: COMMUNITY } },
    events: created(LINDE),
  },
  caseFolderChildren: 1,
  // Write directly after create: whether the new note is indexed before or after the update's
  // write varies (as in `ORDER_FACTS`); the update decides on the text it reads, so it writes
  // the same either way.
  writeAfterCreate: {
    result: {
      ok: true,
      value: { path: SOFORT, frontmatter: { ...COMMUNITY, name: "Gleich danach" } },
    },
    events: [
      `vault:create ${SOFORT}`,
      eitherOrder(`metadataCache:changed ${SOFORT}`, [`vault:modify ${SOFORT}`, "done"]),
      `metadataCache:changed ${SOFORT}`,
    ],
  },
  writtenAfterCreate:
    "---\nschema: weg-manager.community/v1\nname: Gleich danach\ntags:\n  - a\n  - b\n---\n# Ahornweg\n",
};
