import { Effect, Layer, Option, Result } from "effect";
import { AppEvent } from "../../../application/events";
import {
  NoteNotFoundError,
  NoteOpener,
  NoteStore,
  NoteUnreadableError,
  applyPatch,
  type Frontmatter,
  type FrontmatterChange,
  type NewNote,
  type Note,
} from "../../../application/notes";
import {
  asDefect,
  copyFrontmatter,
  createNote,
  pathsInFolder,
  recordNotes,
  planRename,
  trashCommand,
  writeCommand,
} from "../../../application/notes/adapter";
import { EventBus, VaultReadError } from "../../../application/shell";
import { normalizePath } from "./normalize-path";

/**
 * Marks every failure this adapter makes up. `npm run check:dist` refuses a `main.js` that holds
 * it, so the in-memory adapter can never ship in the plugin.
 */
export const TEST_ONLY_MARKER = "weg-manager/test-only";

/** A note as the memory holds it: `undefined` frontmatter means YAML that cannot be parsed. */
type Stored = { readonly frontmatter: Frontmatter | undefined; readonly body: string };

/** How a seed gives a note's frontmatter: a map, none at all, or broken YAML. */
type SeedFrontmatter = Frontmatter | "none" | "broken";

const folderOf = (path: string): string => {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "/" : path.slice(0, slash);
};

const ancestors = (folder: string): string[] =>
  folder === "/"
    ? []
    : folder.split("/").map((_, index, segments) => segments.slice(0, index + 1).join("/"));

const madeUp = (what: string) => new Error(`${TEST_ONLY_MARKER}: ${what}`);

/** Without an event bus, a write publishes nothing. */
const unpublished = (): void => undefined;

/** The extension as Obsidian's `TFile` has it: after the last dot of the name, else empty. */
const extensionOf = (path: string): string => {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1);
};

const file = (path: string) => ({ path, extension: extensionOf(path) });

/** Frontmatter written in another order or with other values: Obsidian would write the file. */
const differs = (before: Frontmatter | undefined, after: Frontmatter): boolean =>
  JSON.stringify(before === undefined ? null : Object.entries(before)) !==
  JSON.stringify(Object.entries(after));

/**
 * The `NoteStore` and `NoteOpener` for tests and the browser harness: a vault in memory that keeps what the
 * Obsidian adapter keeps (frontmatter key order, unknown keys, the body) and fails as it fails. It
 * passes the same contract suite (`tests/support/notes/contract.ts`). Reads see every write at
 * once, where Obsidian's metadata cache lags a moment behind.
 *
 * Its handles seed and delete notes as an outside editor would, look behind the port, and switch failures
 * on: `setFailReads`, `setFailWrites`, and `holdWrites` to keep every write waiting, as a slow disk
 * would, until `releaseWrites`.
 *
 * Built where an `EventBus` is, it publishes for every write and every seed the file events that
 * the host event adapter publishes for the Obsidian adapter (`tests/support/notes/store-events.ts`),
 * so the note index follows it as it follows Obsidian. Folders are not published.
 */
export const memoryNoteStore = () => {
  const notes = new Map<string, Stored>();
  const folders = new Set<string>();
  let failReads = false;
  let failWrites = false;
  let defectWrites = false;
  let open = true;
  let waiting: (() => void)[] = [];
  let publish: (event: AppEvent) => void = unpublished;
  const opened: string[] = [];

  const created = (path: string) => {
    publish(AppEvent.FileCreated(file(path)));
    publish(AppEvent.MetadataChanged(file(path)));
  };
  const modified = (path: string) => {
    publish(AppEvent.FileModified(file(path)));
    publish(AppEvent.MetadataChanged(file(path)));
  };

  const siblingsOf = (folder: string) =>
    [...notes.keys(), ...folders].filter((path) => folderOf(path) === folder);
  const addFolders = (folder: string) => {
    for (const ancestor of ancestors(folder)) folders.add(ancestor);
  };

  const read = <A>(run: () => A) =>
    Effect.suspend(() =>
      failReads
        ? Effect.fail(new VaultReadError({ cause: madeUp("read failed") }))
        : Effect.sync(run),
    );

  const find = (path: string) => {
    const normalized = normalizePath(path);
    const stored = notes.get(normalized);
    return stored === undefined
      ? Effect.fail(new NoteNotFoundError())
      : Effect.succeed({ path: normalized, stored });
  };

  /** Waits like a disk while writes are held, then fails as a read-only disk would. */
  const disk = async () => {
    await new Promise<void>((resolve) => {
      if (open) resolve();
      else waiting.push(resolve);
    });
    if (failWrites) throw madeUp("write failed");
    // A bug in the plugin's own code inside the write: `writeCommand` dies with it.
    if (defectWrites)
      asDefect(() => {
        throw madeUp("plugin code threw");
      });
  };

  /** Applies `apply` after the disk; once started it completes, as Obsidian's writes do. */
  const write = <A, E>(apply: () => Result.Result<A, E>) =>
    writeCommand(async () => {
      await disk();
      return apply();
    });

  const create = (note: NewNote) =>
    createNote(note, normalizePath, siblingsOf, async ({ folder, path, frontmatter }, body) => {
      await disk();
      addFolders(folder);
      notes.set(path, { frontmatter, body });
      created(path);
    });

  const update = <E>(path: string, change: FrontmatterChange<E>) =>
    Effect.flatMap(find(path), (found) =>
      write((): Result.Result<Note, E | NoteNotFoundError | NoteUnreadableError> => {
        const current = notes.get(found.path);
        // Deleted from outside while the write waited for the disk.
        if (current === undefined) return Result.fail(new NoteNotFoundError());
        if (current.frontmatter === undefined) {
          return Result.fail(new NoteUnreadableError({ cause: madeUp("broken YAML") }));
        }
        const frontmatter = current.frontmatter;
        const decided = asDefect(() => change(copyFrontmatter(frontmatter)));
        if (Result.isFailure(decided)) return Result.fail(decided.failure);
        const next = { ...copyFrontmatter(current.frontmatter) };
        applyPatch(next, decided.success);
        notes.set(found.path, { frontmatter: next, body: current.body });
        if (differs(current.frontmatter, next)) modified(found.path);
        return Result.succeed<Note>({ path: found.path, frontmatter: copyFrontmatter(next) });
      }),
    );

  const trash = (path: string) =>
    Effect.flatMap(find(path), (found) =>
      trashCommand(async () => {
        await disk();
        notes.delete(found.path);
        publish(AppEvent.FileDeleted(file(found.path)));
      }),
    );

  const rename = (path: string, newName: string) =>
    Effect.gen(function* () {
      const found = yield* find(path);
      const target = yield* planRename(found.path, newName, normalizePath, siblingsOf);
      const note = { path: target, frontmatter: copyFrontmatter(found.stored.frontmatter) };
      if (target === found.path) return note;
      return yield* write(() => {
        notes.delete(found.path);
        notes.set(target, found.stored);
        publish(AppEvent.FileRenamed({ ...file(target), oldPath: found.path }));
        return Result.succeed<Note>(note);
      });
    });

  const service = NoteStore.of({
    list: read(() =>
      recordNotes([...notes].map(([path, { frontmatter }]) => ({ path, frontmatter }))),
    ),
    unreadable: (folder) =>
      read(() =>
        pathsInFolder(
          [...notes].flatMap(([path, { frontmatter }]) =>
            frontmatter === undefined ? [path] : [],
          ),
          normalizePath(folder),
        ),
      ),
    read: (path) =>
      Effect.flatMap(find(path), (found) =>
        read(() => ({
          path: found.path,
          frontmatter: copyFrontmatter(found.stored.frontmatter),
        })),
      ),
    create,
    update,
    trash,
    rename,
  });
  const layer = Layer.effect(
    NoteStore,
    Effect.map(Effect.serviceOption(EventBus), (bus) => {
      if (Option.isSome(bus)) {
        publish = (event) => {
          // After the runtime's dispose the bus is shut down; an outside edit then reaches no one.
          Effect.runSyncExit(bus.value.publish(event));
        };
      }
      return service;
    }),
  );
  /** The `NoteOpener` over the same notes: it records what it opened, as a tab would show it. */
  const openerLayer = Layer.succeed(NoteOpener)({
    open: (path) =>
      Effect.map(find(path), (found) => {
        opened.push(found.path);
      }),
  });

  return {
    layer,
    /** The `NoteOpener` over these notes; `opened()` lists what it opened. */
    opener: openerLayer,
    /** Writes a note as a person, Sync or an agent would: no checks, no waiting. */
    seed: (path: string, frontmatter: SeedFrontmatter, body = ""): void => {
      addFolders(folderOf(path));
      const existed = notes.has(path);
      notes.set(path, {
        frontmatter:
          frontmatter === "broken"
            ? undefined
            : copyFrontmatter(frontmatter === "none" ? {} : frontmatter),
        body,
      });
      if (existed) modified(path);
      else created(path);
    },
    /** Deletes a note as a person or Sync would, outside the plugin: no checks, no waiting. */
    removeOutside: (path: string): void => {
      if (notes.delete(path)) publish(AppEvent.FileDeleted(file(path)));
    },
    body: (path: string): string | undefined => notes.get(path)?.body,
    isFolder: (path: string): boolean => folders.has(path),
    setFailReads: (fail: boolean): void => {
      failReads = fail;
    },
    setFailWrites: (fail: boolean): void => {
      failWrites = fail;
    },
    /** Every write dies as if the plugin's own code threw inside it: a defect, not a failure. */
    setDefectWrites: (defect: boolean): void => {
      defectWrites = defect;
    },
    holdWrites: (): void => {
      open = false;
    },
    releaseWrites: (): void => {
      open = true;
      const queued = waiting;
      waiting = [];
      for (const resume of queued) resume();
    },
    heldWrites: (): number => waiting.length,
    /** The paths the `NoteOpener` opened, in order. */
    opened: (): readonly string[] => [...opened],
  };
};
