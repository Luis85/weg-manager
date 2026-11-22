import type { ScenarioContext, ScenarioProbe, Step } from "./scenario-context";

/**
 * A scenario that runs unchanged in real Obsidian (`tests/e2e/specs/note-store.e2e.ts`, through
 * `browser.executeObsidian`) and on the Obsidian double (`tests/unit/support/obsidian-double.test.ts`).
 * Both compare the report with the same expectation (`fidelity.ts`, through `inExpectedOrder`), so
 * a difference between the double and Obsidian fails a test. `executeObsidian` serialises each
 * function, so it may use only its arguments: no imports, no module-level helpers, and types only.
 * Key order does not survive `executeObsidian`, so the reports show it through file texts. Each
 * step ends on a fence (`Step`), so its events are recorded in order and in full.
 */

/** What Obsidian's vault, metadata cache and file manager do, called directly. */
export const vaultFacts = async (
  { app, obsidian, plugins }: ScenarioContext,
  input: {
    readonly paths: readonly string[];
    readonly yaml: unknown;
    readonly text: string;
    readonly closings: readonly string[];
  },
) => {
  const recorder = (plugins as { readonly noteStoreProbe: ScenarioProbe }).noteStoreProbe.recorder({
    vault: ["create", "modify", "delete", "rename"],
    cache: ["changed", "deleted"],
    cachePrefix: "metadataCache:",
  });
  const { fence } = recorder;
  const step = <A>(run: () => Promise<A>): Promise<Step<A | string>> =>
    recorder.step(async () => {
      try {
        return await run();
      } catch (error) {
        // Messages of Node errors carry absolute paths, a parser's its own wording: keep the
        // stable part.
        const { name, message } = error as Error;
        if (name !== "Error") return name;
        return `${name}: ${message.startsWith("ENOENT") ? "ENOENT" : message}`;
      }
    });
  const file = (path: string) => {
    const found = app.vault.getFileByPath(path);
    if (found === null) throw new Error(`no file at ${path}`);
    return found;
  };
  const text = (path: string) => app.vault.read(file(path));
  const pfm = (path: string, fn: (frontmatter: Record<string, unknown>) => void) =>
    app.fileManager.processFrontMatter(file(path), fn);

  // Whatever Obsidian still indexes from its start is done once the first fence has passed.
  await fence();
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
    // An update writes through `vault.process`, which hands over and writes the file's own text:
    // a BOM and CRLF included. `vault.read` drops the BOM; the metadata cache reads past it.
    createBom: await step(async () => {
      await app.vault.create("A/bom.md", "﻿---\r\na: 1\r\n---\r\nbody\r\n");
    }),
    bomCache: app.metadataCache.getFileCache(file("A/bom.md"))?.frontmatter,
    bomRead: (await text("A/bom.md")).slice(0, 4),
    processBom: await step(async () => {
      let seen = "";
      const written = await app.vault.process(file("A/bom.md"), (data) => {
        seen = data;
        return data.replace("a: 1", "a: 2");
      });
      return [seen, written];
    }),
    processThrows: await step(() =>
      app.vault.process(file("A/bom.md"), () => {
        throw new TypeError("stop");
      }),
    ),
    createGone: await step(async () => {
      await app.vault.create("A/gone.md", "x");
    }),
    // A note deleted after it was looked up: `process` rejects without calling back.
    processGone: await step(async () => {
      const gone = file("A/gone.md");
      await app.fileManager.trashFile(gone);
      let called = false;
      try {
        await app.vault.process(gone, (data) => {
          called = true;
          return data;
        });
      } catch (error) {
        const { message } = error as Error;
        return { rejected: message.startsWith("ENOENT") ? "ENOENT" : message, called };
      }
      return { rejected: null, called };
    }),
    // Where the metadata cache closes a block: each text has a candidate closing line on line 2
    // and a plain `---` on line 4. Created all at once, so their events are left out here; the
    // order of parallel creates is `orderScenario`'s.
    createClosings: await (async () => {
      await Promise.all(
        input.closings.map((closing, index) => app.vault.create(`A/close-${index}.md`, closing)),
      );
      await fence();
      return input.closings.length;
    })(),
    // The line the block ends on, and whether the YAML up to it reads as a map: where the block
    // runs on to line 4, ` ---` and `...` belong to the YAML.
    closings: input.closings.map((_, index) => {
      const cache = app.metadataCache.getFileCache(file(`A/close-${index}.md`));
      return [
        cache?.sections?.find((section) => section.type === "yaml")?.position.end.line,
        cache?.frontmatter !== undefined,
      ];
    }),
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
  recorder.dispose();
  // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
  return JSON.parse(JSON.stringify(report)) as typeof report;
};
