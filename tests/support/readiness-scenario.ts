import type { App } from "obsidian";

/**
 * What the metadata cache fires around an edit in a running app, as a scenario that runs unchanged
 * in real Obsidian (`tests/e2e/specs/vault-ready.e2e.ts`, through `browser.executeObsidian`) and
 * on the Obsidian double (`tests/unit/support/obsidian-double.test.ts`); both compare with
 * `READINESS_FACTS`. `executeObsidian` serialises the function, so it uses only its arguments.
 */
export const readinessScenario = async ({ app }: { readonly app: App }, settleMs: number) => {
  const events: string[] = [];
  const cache = app.metadataCache;
  const refs = [
    cache.on("changed", (file) => events.push(`changed ${file.path}`)),
    cache.on("resolve", (file) => events.push(`resolve ${file.path}`)),
    cache.on("resolved", () => events.push("resolved")),
    cache.on("deleted", (file) => events.push(`deleted ${file.path}`)),
  ];
  const deleteRef = app.vault.on("delete", (file) => events.push(`vault:delete ${file.path}`));
  const settle = () => new Promise((resolve) => setTimeout(resolve, settleMs));
  const step = async (run: () => Promise<unknown>) => {
    events.length = 0;
    await run();
    await settle();
    return [...events];
  };
  const path = "Bereitschaft.md";
  const file = () => {
    const found = app.vault.getFileByPath(path);
    if (found === null) throw new Error(`no file at ${path}`);
    return found;
  };
  try {
    return {
      create: await step(() => app.vault.create(path, "---\na: 1\n---\n")),
      cachedAfterCreate: app.metadataCache.getFileCache(file())?.frontmatter ?? null,
      process: await step(() => app.vault.process(file(), () => "---\na: 2\n---\n")),
      unchanged: await step(() => app.vault.process(file(), (text) => text)),
      trash: await step(() => app.fileManager.trashFile(file())),
    };
  } finally {
    for (const ref of refs) cache.offref(ref);
    app.vault.offref(deleteRef);
  }
};

/** What Obsidian 1.15.1 does, measured by `tests/e2e/specs/vault-ready.e2e.ts`. */
export const READINESS_FACTS = {
  create: ["changed Bereitschaft.md", "resolve Bereitschaft.md", "resolved"],
  cachedAfterCreate: { a: 1 },
  process: ["changed Bereitschaft.md", "resolve Bereitschaft.md", "resolved"],
  unchanged: [],
  trash: ["deleted Bereitschaft.md", "vault:delete Bereitschaft.md", "resolved"],
};
