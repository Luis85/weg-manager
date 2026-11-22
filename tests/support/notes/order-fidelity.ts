import { eitherOrder } from "./event-order";

/**
 * The report of `orderScenario` (`order-scenario.ts`) as Obsidian 1.15.1 fires it, measured over
 * nine runs (four on an idle machine, five beside eight busy processes): a file's `changed` comes
 * after the write's promise, `resolve` and `resolved` after it; a rename's and a trash's
 * `resolved` after their promise. Where the order varied it is written as `eitherOrder`; what
 * varies in number is left out of the scenario and said there: how many `resolved` several files
 * indexed together get, and whether a new file's index or the next create comes first.
 */

export const ORDER_FACTS = {
  // Write directly after create: whether the create is indexed before or after the write varies
  // (one run in nine the write came first); either way the cache ends on the written text.
  writeAfterCreate: {
    result: "---\na: 2\n---\n",
    events: [
      "vault:create Sofort.md",
      eitherOrder("changed Sofort.md", ["vault:modify Sofort.md", "done"]),
      "changed Sofort.md",
    ],
  },
  cachedAfterWrite: { a: 2 },
  // Indexed in the order they were created.
  parallelCreates: {
    events: [
      "vault:create P1.md",
      "vault:create P2.md",
      "vault:create P3.md",
      "done",
      "changed P1.md",
      "changed P2.md",
      "changed P3.md",
    ],
  },
  // The folder first, then everything inside in the vault's order; the cache keeps its metadata.
  renameFolder: {
    events: [
      "vault:rename R/A -> R/Q",
      "vault:rename R/A/B -> R/Q/B",
      "vault:rename R/A/b.md -> R/Q/b.md",
      "vault:rename R/A/a.md -> R/Q/a.md",
      "vault:rename R/A/B/c.md -> R/Q/B/c.md",
      "vault:rename R/A/B/d.txt -> R/Q/B/d.txt",
      "vault:rename R/A/C -> R/Q/C",
      "done",
      "resolved",
    ],
  },
  renamed: {
    folder: "R/Q",
    note: "R/Q/b.md",
    sameNote: true,
    oldPath: null,
    children: ["R/Q/B", "R/Q/b.md", "R/Q/a.md", "R/Q/C"],
    cached: { b: 1 },
  },
  renameFolderOntoFile: { result: "Destination file already exists!", events: ["done"] },
  renameFile: { events: ["vault:rename P1.md -> R/P1.md", "done", "resolved"] },
  trashFile: { result: true, events: ["deleted P2.md", "vault:delete P2.md", "done", "resolved"] },
  // The folder's contents in the vault's order (a renamed entry joins it again), the folder last;
  // the metadata cache's `deleted` also for a file that is no note.
  trashFolder: {
    result: true,
    events: [
      "vault:delete R/Q/B",
      "deleted R/Q/b.md",
      "vault:delete R/Q/b.md",
      "deleted R/Q/a.md",
      "vault:delete R/Q/a.md",
      "deleted R/Q/B/c.md",
      "vault:delete R/Q/B/c.md",
      "deleted R/Q/B/d.txt",
      "vault:delete R/Q/B/d.txt",
      "vault:delete R/Q/C",
      "vault:delete R/Q",
      "done",
      "resolved",
    ],
  },
};
