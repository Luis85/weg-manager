import type { App } from "obsidian";
import type { ScenarioProbe } from "./notes/scenario-context";

/**
 * What the metadata cache fires around an edit in a running app, as a scenario that runs unchanged
 * in real Obsidian (`tests/e2e/specs/vault-ready.e2e.ts`, through `browser.executeObsidian`) and
 * on the Obsidian double (`tests/unit/support/obsidian-double.test.ts`); both compare with
 * `READINESS_FACTS`. Each step ends on the recorder's fence, not on a timer
 * (`notes/recorder.ts`), and `done` marks where the call's promise settled. `executeObsidian`
 * serialises the function, so it uses only its arguments.
 */
export const readinessScenario = async ({
  app,
  plugins,
}: {
  readonly app: App;
  readonly plugins: unknown;
}) => {
  const recorder = (plugins as { readonly noteStoreProbe: ScenarioProbe }).noteStoreProbe.recorder({
    vault: ["delete"],
    cache: ["changed", "resolve", "resolved", "deleted"],
  });
  const path = "Bereitschaft.md";
  const file = () => {
    const found = app.vault.getFileByPath(path);
    if (found === null) throw new Error(`no file at ${path}`);
    return found;
  };
  const step = async (run: () => Promise<unknown>) => (await recorder.step(run)).events;
  try {
    await recorder.fence();
    return {
      create: await step(() => app.vault.create(path, "---\na: 1\n---\n")),
      cachedAfterCreate: app.metadataCache.getFileCache(file())?.frontmatter ?? null,
      process: await step(() => app.vault.process(file(), () => "---\na: 2\n---\n")),
      unchanged: await step(() => app.vault.process(file(), (text) => text)),
      trash: await step(() => app.fileManager.trashFile(file())),
    };
  } finally {
    recorder.dispose();
  }
};

/**
 * What Obsidian 1.15.1 does, measured by `tests/e2e/specs/vault-ready.e2e.ts`: the index of a
 * write follows its promise, `resolved` follows a trash's promise.
 */
export const READINESS_FACTS = {
  create: ["done", "changed Bereitschaft.md", "resolve Bereitschaft.md", "resolved"],
  cachedAfterCreate: { a: 1 },
  process: ["done", "changed Bereitschaft.md", "resolve Bereitschaft.md", "resolved"],
  unchanged: ["done"],
  trash: ["deleted Bereitschaft.md", "vault:delete Bereitschaft.md", "done", "resolved"],
};
