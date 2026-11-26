import { Effect, Layer } from "effect";
import {
  LocalFileRemoveError,
  LocalFiles,
  NoteNotFoundError,
  VaultFiles,
  type PickedFile,
} from "../../../application/notes";
import { planNewFile } from "../../../application/notes/adapter";
import { normalizePath } from "./normalize-path";

/** The folder a path lies in; `/` for the vault root. */
const parentOf = (path: string) => {
  const slash = path.lastIndexOf("/");
  return slash < 0 ? "/" : path.slice(0, slash);
};

/**
 * In-memory `VaultFiles` for tests and the harness, beside the in-memory notes: files by path,
 * `seed` puts one there as a person would, `bytes` reads one, `opened` lists what was opened.
 * Its folders are the folders of its files.
 */
export const memoryVaultFiles = () => {
  const files = new Map<string, Uint8Array>();
  const opened: string[] = [];
  const siblingsOf = (folder: string) => {
    const children = new Set<string>();
    for (const path of files.keys()) {
      let child = path;
      while (parentOf(child) !== folder && parentOf(child) !== "/") child = parentOf(child);
      if (parentOf(child) === folder) children.add(child);
    }
    return [...children];
  };
  const foldersIn = (folder: string) => siblingsOf(folder).filter((path) => !files.has(path));
  const plan = (folder: string, name: string, planned: readonly string[] = []) =>
    planNewFile(folder, name, normalizePath, siblingsOf, foldersIn, planned);
  const layer = Layer.succeed(VaultFiles)({
    exists: (path) => Effect.sync(() => files.has(normalizePath(path))),
    // As Obsidian: the exact path, else the one file whose name the link names.
    resolve: (linkpath) =>
      Effect.sync(() => {
        const exact = normalizePath(linkpath);
        if (files.has(exact)) return exact;
        const named = [...files.keys()].filter((path) => path.endsWith(`/${exact}`));
        return named.length === 1 ? named[0] : undefined;
      }),
    freePath: (folder, name, planned) =>
      Effect.map(plan(folder, name, planned), ({ path }) => path),
    write: (folder, name, bytes) =>
      Effect.map(plan(folder, name), ({ path }) => {
        files.set(path, bytes.slice());
        return path;
      }),
    resourceUrl: (path) =>
      Effect.sync(() =>
        files.has(normalizePath(path)) ? `memory://${normalizePath(path)}` : undefined,
      ),
    open: (path) =>
      files.has(normalizePath(path))
        ? Effect.sync(() => {
            opened.push(normalizePath(path));
          })
        : Effect.fail(new NoteNotFoundError()),
  });
  return {
    layer,
    seed: (path: string, bytes: Uint8Array = new Uint8Array([1])) => {
      files.set(normalizePath(path), bytes);
    },
    remove: (path: string) => {
      files.delete(normalizePath(path));
    },
    bytes: (path: string) => files.get(normalizePath(path)),
    paths: () => [...files.keys()].toSorted(),
    opened: () => [...opened],
  };
};

/**
 * In-memory `LocalFiles`: a picked file is movable when its handle is a string (its path outside
 * the vault); `removed` lists the paths removed, `failing` makes every removal fail.
 */
export const memoryLocalFiles = () => {
  const removed: string[] = [];
  let failing = false;
  const layer = Layer.succeed(LocalFiles)({
    movable: (file: PickedFile) => Effect.succeed(typeof file.handle === "string"),
    remove: (file: PickedFile) =>
      failing || typeof file.handle !== "string"
        ? Effect.fail(new LocalFileRemoveError({ cause: new Error("not removable") }))
        : Effect.sync(() => {
            removed.push(file.handle as string);
          }),
  });
  return {
    layer,
    removed: () => [...removed],
    setFailing: (next: boolean) => {
      failing = next;
    },
  };
};
