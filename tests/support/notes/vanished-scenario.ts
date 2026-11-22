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
 * with `VANISHED_FACTS`. In Obsidian the note is written from outside too, so it is the file
 * watcher that reports it, and the scenario waits until the metadata cache has read it: a note
 * created through the vault and deleted at once can still be read by Obsidian's own watcher
 * afterwards, which rejects with ENOENT, unhandled (seen once in five runs). The call comes right
 * after the delete, with no turn of the event loop in between, so the watcher cannot have reported
 * it. `executeObsidian` serialises the function, so
 * it uses only its arguments and what it defines itself.
 */
export const vanishedScenario = async ({ app }: { readonly app: App }): Promise<VanishedReport> => {
  const path = "Verschwunden.md";
  const text = "---\na: 1\n---\n";
  type NodeRequire = (name: string) => {
    writeFileSync(path: string, text: string): void;
    unlinkSync(path: string): void;
    join(...parts: string[]): string;
  };
  const nodeRequire =
    typeof window === "undefined"
      ? undefined
      : (window as unknown as { require?: NodeRequire }).require;
  const onDisk = () =>
    nodeRequire === undefined
      ? ""
      : nodeRequire("path").join(
          (app.vault.adapter as unknown as { basePath: string }).basePath,
          path,
        );
  // Listed and indexed first: the delete must not race the first read.
  const file = await new Promise<TFile>((done, fail) => {
    const ref = app.metadataCache.on("changed", (changed) => {
      if (changed.path !== path) return;
      app.metadataCache.offref(ref);
      done(changed);
    });
    if (nodeRequire === undefined) app.vault.create(path, text).catch(fail);
    else nodeRequire("fs").writeFileSync(onDisk(), text);
  });
  if (nodeRequire === undefined) {
    (app.vault as unknown as { vanish(path: string): void }).vanish(path);
  } else {
    nodeRequire("fs").unlinkSync(onDisk());
  }
  const listedAfterDelete = app.vault.getFileByPath(path) === file;
  let called = false;
  try {
    await app.vault.process(file, (data) => {
      called = true;
      return data;
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
