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
    await step(async () => {
      await Promise.all(
        ["W", "O1", "O2", "O3", "Belegt"].map((name) =>
          app.vault.create(`${name}.md`, `---\nn: ${name}\n---\n`),
        ),
      );
    });
    // A rename right after a write: `renameFile` first waits until the metadata cache has
    // indexed the write, so the cache holds the written frontmatter once it has resolved.
    const renameAfterWrite = await step(async () => {
      const written = file("W.md");
      await app.vault.process(written, () => "---\nn: neu\n---\n");
      await app.fileManager.renameFile(written, "W2.md");
      return app.metadataCache.getFileCache(written)?.frontmatter;
    });
    // A rename asked for while another rename moves its file (here from that move's `rename`
    // event, as another plugin or the user's own rename could): Obsidian lets it join the first
    // one's link update, so its promise resolves before its file moves, and a move that fails
    // rejects the first caller's promise while its own has resolved. `resolved` is left out:
    // where the first move's comes among the others is Obsidian's timing.
    const overlapping = (firstPath: string, target: string, queued: string, queuedTarget: string) =>
      step(
        async () => {
          const first = file(firstPath);
          const second = file(queued);
          let joined: Promise<string> | undefined;
          const ref = app.vault.on("rename", (moved) => {
            if (moved !== first || joined !== undefined) return;
            joined = app.fileManager.renameFile(second, queuedTarget).then(
              () => {
                recorder.mark(`second resolved, its file at ${second.path}`);
                return "renamed";
              },
              (error: Error) => error.message,
            );
          });
          try {
            const settled = await app.fileManager.renameFile(first, target).then(
              () => "renamed",
              (error: Error) => error.message,
            );
            return { first: settled, second: (await joined) ?? null, queuedAt: second.path };
          } finally {
            app.vault.offref(ref);
          }
        },
        (event) => !event.startsWith("resolve"),
      );
    const renameDuringRename = await overlapping("O1.md", "O1b.md", "O2.md", "O2b.md");
    const failingJoinedRename = await overlapping("O1b.md", "O1c.md", "O3.md", "Belegt.md");
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
      renameAfterWrite,
      renameDuringRename,
      failingJoinedRename,
    };
    // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
    return JSON.parse(JSON.stringify(report)) as typeof report;
  } finally {
    recorder.dispose();
  }
};
