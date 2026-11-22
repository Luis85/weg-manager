import type { App, TFile } from "obsidian";

/** What `vanishedScenario` finds out. */
export type VanishedReport = {
  /** The vault still lists the file right after it was deleted outside. */
  readonly listedAfterDelete: boolean;
  /** `process` called back with the file's text: it must not, the file is gone. */
  readonly called: boolean;
  readonly rejected: {
    readonly isError: boolean;
    readonly name: string;
    readonly code: unknown;
    readonly errno: unknown;
    readonly syscall: unknown;
    /** The message up to the path, which differs per machine. */
    readonly message: string;
  } | null;
};

/**
 * `vault.process` on a note that was deleted from outside Obsidian (a person, Sync, an agent)
 * while Obsidian still lists it: between the delete and the report of its file watcher. Runs
 * unchanged in real Obsidian (`tests/e2e/specs/note-vanished.e2e.ts`, through
 * `browser.executeObsidian`), where it deletes the file with Node's `fs`, and on the Obsidian
 * double (`tests/unit/support/obsidian-double.test.ts`), where `vault.vanish` does; both compare
 * with `VANISHED_FACTS`. The call comes right after the delete, with no turn of the event loop in
 * between, so the watcher cannot have reported it. `executeObsidian` serialises the function, so
 * it uses only its arguments and what it defines itself.
 */
export const vanishedScenario = async ({ app }: { readonly app: App }): Promise<VanishedReport> => {
  const path = "Verschwunden.md";
  // Created and indexed first: the delete must not race the metadata cache's first read.
  const file = await new Promise<TFile>((done, fail) => {
    const ref = app.metadataCache.on("changed", (changed) => {
      if (changed.path !== path) return;
      app.metadataCache.offref(ref);
      done(changed);
    });
    app.vault.create(path, "---\na: 1\n---\n").catch(fail);
  });
  type NodeRequire = (name: string) => {
    unlinkSync(path: string): void;
    join(...parts: string[]): string;
  };
  const nodeRequire =
    typeof window === "undefined"
      ? undefined
      : (window as unknown as { require?: NodeRequire }).require;
  if (nodeRequire === undefined) {
    (app.vault as unknown as { vanish(path: string): void }).vanish(path);
  } else {
    const basePath = (app.vault.adapter as unknown as { basePath: string }).basePath;
    nodeRequire("fs").unlinkSync(nodeRequire("path").join(basePath, path));
  }
  const listedAfterDelete = app.vault.getFileByPath(path) === file;
  let called = false;
  try {
    await app.vault.process(file, (text) => {
      called = true;
      return text;
    });
  } catch (error) {
    const rejection = error as Error & { code?: unknown; errno?: unknown; syscall?: unknown };
    return {
      listedAfterDelete,
      called,
      rejected: {
        isError: error instanceof Error,
        name: rejection.name,
        code: rejection.code ?? null,
        errno: rejection.errno ?? null,
        syscall: rejection.syscall ?? null,
        message: rejection.message.split("'")[0] ?? "",
      },
    };
  }
  return { listedAfterDelete, called, rejected: null };
};

/** What Obsidian 1.15.1 does, measured by `tests/e2e/specs/note-vanished.e2e.ts`. */
export const VANISHED_FACTS: VanishedReport = {
  listedAfterDelete: true,
  called: false,
  rejected: {
    isError: true,
    name: "Error",
    code: "ENOENT",
    errno: -2,
    syscall: "open",
    message: "ENOENT: no such file or directory, open ",
  },
};
