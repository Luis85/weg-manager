import type { ScenarioContext, ScenarioProbe } from "./scenario-context";

/**
 * The order of events, `resolve` and `resolved` included, where it matters to the plugin: a write
 * directly after a create, creates in parallel, a folder renamed and trashed with notes inside, a
 * single rename and trash. Runs unchanged in real Obsidian (`note-store.e2e.ts`) and on the double
 * (`obsidian-double.test.ts`); both compare with `ORDER_FACTS` (`order-fidelity.ts`), where an
 * order Obsidian does not keep the same from run to run is written as `anyOrder(…)`.
 * `executeObsidian` serialises the function, so it uses only its arguments.
 */
export const orderScenario = async ({ app, plugins }: ScenarioContext) => {
  const recorder = (plugins as { readonly noteStoreProbe: ScenarioProbe }).noteStoreProbe.recorder({
    vault: ["create", "modify", "delete", "rename"],
    cache: ["changed", "resolve", "resolved", "deleted"],
  });
  const { fence, step } = recorder;
  const file = (path: string) => {
    const found = app.vault.getFileByPath(path);
    if (found === null) throw new Error(`no file at ${path}`);
    return found;
  };
  const folder = (path: string) => {
    const found = app.vault.getFolderByPath(path);
    if (found === null) throw new Error(`no folder at ${path}`);
    return found;
  };
  const frontmatter = (path: string) => app.metadataCache.getFileCache(file(path))?.frontmatter;

  await fence();
  try {
    // `resolve` and `resolved` follow a file's `changed`, but may come after the next write
    // (measured once in five loaded runs), so this step leaves them out.
    const writeAfterCreate = await step(
      async () => {
        const created = await app.vault.create("Sofort.md", "---\na: 1\n---\n");
        return app.vault.process(created, () => "---\na: 2\n---\n");
      },
      (event) => !event.startsWith("resolve"),
    );
    const cachedAfterWrite = frontmatter("Sofort.md");
    // Indexed in the order they were created. How many `resolved` Obsidian fires for files indexed
    // together varies (one each, or one for several), so this step leaves `resolve` and
    // `resolved` out.
    const parallelCreates = await step(
      async () => {
        await Promise.all(
          ["P1", "P2", "P3"].map((name) =>
            app.vault.create(`${name}.md`, `---\nn: ${name}\n---\n`),
          ),
        );
      },
      (event) => !event.startsWith("resolve"),
    );
    // Not recorded: whether a file's index or the next create comes first varies.
    await step(async () => {
      await app.vault.createFolder("R/A/B");
      await app.vault.create("R/A/b.md", "---\nb: 1\n---\n");
      await app.vault.create("R/A/a.md", "---\na: 1\n---\n");
      await app.vault.create("R/A/B/c.md", "---\nc: 1\n---\n");
      await app.vault.create("R/A/B/d.txt", "x");
      await app.vault.createFolder("R/A/C");
    });
    const moving = folder("R/A");
    const note = file("R/A/b.md");
    const renameFolder = await step(() => app.fileManager.renameFile(moving, "R/Q"));
    const renamed = {
      folder: moving.path,
      note: note.path,
      sameNote: app.vault.getFileByPath("R/Q/b.md") === note,
      oldPath: app.vault.getAbstractFileByPath("R/A/b.md"),
      children: folder("R/Q").children.map((child) => child.path),
      cached: app.metadataCache.getFileCache(note)?.frontmatter,
    };
    const renameFolderOntoFile = await step(() =>
      app.fileManager.renameFile(folder("R/Q"), "Sofort.md").then(
        () => "renamed",
        (error: Error) => error.message,
      ),
    );
    const renameFile = await step(() => app.fileManager.renameFile(file("P1.md"), "R/P1.md"));
    const trashFile = await step(() => app.fileManager.trashFile(file("P2.md")));
    const trashFolder = await step(() => app.fileManager.trashFile(folder("R/Q")));
    const report = {
      writeAfterCreate,
      cachedAfterWrite,
      parallelCreates,
      renameFolder,
      renamed,
      renameFolderOntoFile,
      renameFile,
      trashFile,
      trashFolder,
    };
    // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
    return JSON.parse(JSON.stringify(report)) as typeof report;
  } finally {
    recorder.dispose();
  }
};
