import type { App } from "obsidian";
import type { Outcome, ProbeApi } from "./probe-api";

/**
 * Two scenarios that run unchanged in real Obsidian (`tests/e2e/specs/note-store.e2e.ts`, through
 * `browser.executeObsidian`) and on the Obsidian double (`tests/unit/support/obsidian-double.test.ts`).
 * Both compare the report with the same expectation (`fidelity.ts`), so a difference between the
 * double and Obsidian fails a test. `executeObsidian` serialises each function, so it may use only
 * its arguments: no imports, no module-level helpers, and types only. Key order does not survive
 * `executeObsidian`, so the reports show it through file texts.
 */

type Context = {
  readonly app: App;
  readonly obsidian: {
    normalizePath(path: string): string;
    stringifyYaml(value: unknown): string;
    parseYaml(yaml: string): unknown;
  };
  readonly plugins: unknown;
};

type Step<A> = { readonly result: A; readonly events: readonly string[] };

/** What Obsidian's vault, metadata cache and file manager do, called directly. */
export const vaultFacts = async (
  { app, obsidian }: Context,
  input: { readonly paths: readonly string[]; readonly yaml: unknown; readonly text: string },
  settleMs: number,
) => {
  const events: string[] = [];
  const refs = [
    app.vault.on("create", (file) => events.push(`vault:create ${file.path}`)),
    app.vault.on("modify", (file) => events.push(`vault:modify ${file.path}`)),
    app.vault.on("delete", (file) => events.push(`vault:delete ${file.path}`)),
    app.vault.on("rename", (file, old) => events.push(`vault:rename ${old} -> ${file.path}`)),
  ];
  const cacheRefs = [
    app.metadataCache.on("changed", (file) => events.push(`metadataCache:changed ${file.path}`)),
    app.metadataCache.on("deleted", (file) => events.push(`metadataCache:deleted ${file.path}`)),
  ];
  const settle = () => new Promise((resolve) => setTimeout(resolve, settleMs));
  const step = async <A>(run: () => Promise<A>): Promise<Step<A | string>> => {
    events.length = 0;
    let result: A | string;
    try {
      result = await run();
    } catch (error) {
      // Messages of Node errors carry absolute paths, a parser's its own wording: keep the stable part.
      const { name, message } = error as Error;
      if (name !== "Error") result = name;
      else result = `${name}: ${message.startsWith("ENOENT") ? "ENOENT" : message}`;
    }
    await settle();
    return { result, events: [...events] };
  };
  const file = (path: string) => {
    const found = app.vault.getFileByPath(path);
    if (found === null) throw new Error(`no file at ${path}`);
    return found;
  };
  const text = (path: string) => app.vault.read(file(path));
  const pfm = (path: string, fn: (frontmatter: Record<string, unknown>) => void) =>
    app.fileManager.processFrontMatter(file(path), fn);

  const report = {
    normalized: input.paths.map((path) => obsidian.normalizePath(path)),
    stringified: obsidian.stringifyYaml(input.yaml),
    parsed: obsidian.parseYaml(input.text),
    createInMissingFolder: await step(() => app.vault.create("Fehlt/A.md", "")),
    createFolders: await step(async () => (await app.vault.createFolder("A/B/C")).path),
    createFolderAgain: await step(() => app.vault.createFolder("A")),
    create: await step(async () => {
      const created = await app.vault.create("A/n.md", "---\na: 1\nb: 2\n---\nbody\n");
      return app.metadataCache.getFileCache(created);
    }),
    createAgain: await step(() => app.vault.create("A/n.md", "")),
    cacheAfterCreate: app.metadataCache.getFileCache(file("A/n.md"))?.frontmatter,
    // The store finds name clashes among a folder's children; lookups by path are case-sensitive.
    children: app.vault
      .getFolderByPath("A")
      ?.children.map((child) => child.path)
      .toSorted(),
    rootChildren: app.vault.getRoot().children.some((child) => child.path === "A"),
    lookupInOtherCase: app.vault.getAbstractFileByPath("a/N.md"),
    processUnchanged: await step(() => app.vault.process(file("A/n.md"), (data) => data)),
    frontmatterUnchanged: await step(() => pfm("A/n.md", (fm) => Object.assign(fm, { a: 1 }))),
    frontmatterThrows: await step(() =>
      pfm("A/n.md", (fm) => {
        fm["a"] = 3;
        throw new Error("stop");
      }),
    ),
    frontmatterChanged: await step(async () => {
      await pfm("A/n.md", (fm) => {
        fm["a"] = 5;
        fm["c"] = ["x"];
      });
      return app.metadataCache.getFileCache(file("A/n.md"))?.frontmatter;
    }),
    textAfterChange: await text("A/n.md"),
    // Settled first: whether the index of a new file or an immediate write to it comes first
    // varies from run to run in Obsidian.
    createPlain: await step(async () => {
      await app.vault.create("A/plain.md", "# Plain\n");
    }),
    plain: await step(async () => {
      await pfm("A/plain.md", (fm) => {
        fm["k"] = "v";
      });
      return text("A/plain.md");
    }),
    allKeysDeleted: await step(async () => {
      await pfm("A/plain.md", (fm) => {
        delete fm["k"];
      });
      return text("A/plain.md");
    }),
    createBroken: await step(async () => {
      await app.vault.create("A/broken.md", "---\nschema: [unclosed\n---\nbody\n");
    }),
    brokenCache: ((cache) => ({
      frontmatter: cache?.frontmatter,
      position: cache?.frontmatterPosition !== undefined,
    }))(app.metadataCache.getFileCache(file("A/broken.md"))),
    // A block of broken YAML has no `frontmatter` and no position, but a `yaml` section, as a
    // block that holds nothing; a plain note has no `yaml` section.
    createEmptyBlock: await step(async () => {
      await app.vault.create("A/empty.md", "---\n---\nbody\n");
    }),
    blocks: ["A/broken.md", "A/empty.md", "A/n.md", "A/plain.md"].map((path) => {
      const cache = app.metadataCache.getFileCache(file(path));
      const yaml = cache?.sections?.find((section) => section.type === "yaml");
      return {
        path,
        frontmatter: cache?.frontmatter !== undefined,
        yaml: yaml === undefined ? null : [yaml.position.start.line, yaml.position.end.line],
      };
    }),
    brokenYaml: await step(() =>
      pfm("A/broken.md", (fm) => {
        fm["a"] = 1;
      }),
    ),
    renameOntoFile: await step(() => app.fileManager.renameFile(file("A/plain.md"), "A/n.md")),
    renameIntoMissingFolder: await step(() =>
      app.fileManager.renameFile(file("A/plain.md"), "Fehlt/plain.md"),
    ),
    rename: await step(async () => {
      const before = file("A/plain.md");
      await app.fileManager.renameFile(before, "A/B/moved.md");
      return { same: app.vault.getFileByPath("A/B/moved.md") === before, path: before.path };
    }),
    trashFile: await step(() => app.fileManager.trashFile(file("A/n.md"))),
    trashFolder: await step(async () => {
      const folder = app.vault.getFolderByPath("A/B");
      if (folder === null) throw new Error("no folder A/B");
      await app.fileManager.trashFile(folder);
    }),
  };
  for (const ref of refs) app.vault.offref(ref);
  for (const ref of cacheRefs) app.metadataCache.offref(ref);
  // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
  return JSON.parse(JSON.stringify(report)) as typeof report;
};

/** The probe plugin's `NoteStore` on a small vault, with the events each call fires. */
export const storeScenario = async ({ app, plugins }: Context, settleMs: number) => {
  const probe = (plugins as { readonly noteStoreProbe: { readonly api: ProbeApi } }).noteStoreProbe
    .api;
  const events: string[] = [];
  const refs = [
    app.vault.on("create", (file) => events.push(`vault:create ${file.path}`)),
    app.vault.on("modify", (file) => events.push(`vault:modify ${file.path}`)),
    app.vault.on("delete", (file) => events.push(`vault:delete ${file.path}`)),
    app.vault.on("rename", (file, old) => events.push(`vault:rename ${old} -> ${file.path}`)),
  ];
  const cacheRefs = [
    app.metadataCache.on("changed", (file) => events.push(`metadataCache:changed ${file.path}`)),
    app.metadataCache.on("deleted", (file) => events.push(`metadataCache:deleted ${file.path}`)),
  ];
  const settle = () => new Promise((resolve) => setTimeout(resolve, settleMs));
  const step = async <A>(run: () => Promise<Outcome<A>>): Promise<Step<Outcome<A>>> => {
    events.length = 0;
    const result = await run();
    await settle();
    return { result, events: [...events] };
  };
  const text = async (path: string) => {
    const file = app.vault.getFileByPath(path);
    return file === null ? null : app.vault.read(file);
  };
  const community = {
    folder: "WEG Manager/Gemeinschaften",
    name: "Ahornweg",
    frontmatter: { schema: "weg-manager.community/v1", name: "Ahornweg 12", tags: ["a", "b"] },
    body: "# Ahornweg\n",
  };

  // Notes from outside the plugin, as a person or an agent writes them.
  await app.vault.createFolder("Archiv");
  await app.vault.create(
    "Archiv/Fremd.md",
    "---\nschema: weg-manager.community/v1\nzeta: 1\nname: Alt\nunknown: kept\ngone: true\n---\n# Fremd\n\nText bleibt.\n",
  );
  await app.vault.create("Ohne Schema.md", "---\ntitle: Notiz\n---\nText\n");
  await app.vault.create("Kaputt.md", "---\nschema: [unclosed\n---\nText\n");
  await app.vault.create("Archiv/Kaputt.md", "---\nschema: [unclosed\n---\nText\n");
  await settle();

  const report = {
    create: await step(() => probe.create(community)),
    createdText: await text("WEG Manager/Gemeinschaften/Ahornweg.md"),
    clash: await step(() => probe.create(community)),
    list: await step(() => probe.list()),
    unreadable: await step(() => probe.unreadable("Archiv")),
    // On Linux the disk would take "ahornweg.md" beside "Ahornweg.md"; the store must not.
    caseClash: await step(() => probe.create({ ...community, name: "ahornweg" })),
    update: await step(() =>
      probe.update("Archiv/Fremd.md", { set: { name: "Neu", added: "x" }, remove: ["gone"] }),
    ),
    updatedText: await text("Archiv/Fremd.md"),
    unchanged: await step(() => probe.update("Archiv/Fremd.md", { set: { name: "Neu" } })),
    refused: await step(() => probe.update("Archiv/Fremd.md", { refuse: "Conflict" })),
    broken: await step(() => probe.update("Kaputt.md", { set: { a: 1 } })),
    rename: await step(() => probe.rename("/Archiv//Fremd.md", "Umbenannt")),
    renamedText: await text("Archiv/Umbenannt.md"),
    renameCase: await step(() => probe.rename("Archiv/Umbenannt.md", "UMBENANNT")),
    renameTaken: await step(() =>
      probe.rename("WEG Manager/Gemeinschaften/Ahornweg (2).md", "AHORNWEG"),
    ),
    trash: await step(() => probe.trash("WEG Manager/Gemeinschaften/Ahornweg (2).md")),
    readTrashed: await step(() => probe.read("WEG Manager/Gemeinschaften/Ahornweg (2).md")),
    finalList: await step(() => probe.list()),
  };
  for (const ref of refs) app.vault.offref(ref);
  for (const ref of cacheRefs) app.metadataCache.offref(ref);
  // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
  return JSON.parse(JSON.stringify(report)) as typeof report;
};
