import { Effect, Layer, Result } from "effect";
import { Platform, normalizePath, type App } from "obsidian";
import {
  LocalFileRemoveError,
  LocalFiles,
  NoteNotFoundError,
  VaultFiles,
  type PickedFile,
} from "../../../application/notes";
import { planNewFile, writeCommand } from "../../../application/notes/adapter";
import { openInTab, vaultTree } from "./vault-tree";

/**
 * The `VaultFiles` on Obsidian (ADR 0007, amendment 26.11.2026): adds a file only through
 * `vault.createFolder` and `vault.createBinary`, on the first free path, so nothing is ever
 * overwritten; shows a file through `vault.getResourcePath` and opens it in a new tab.
 */
export const vaultFilesLayer = (app: App): Layer.Layer<VaultFiles> => {
  const { vault } = app;
  const { siblingsOf, foldersIn } = vaultTree(vault);
  const plan = (folder: string, name: string, planned: readonly string[] = []) =>
    planNewFile(folder, name, normalizePath, siblingsOf, foldersIn, planned);
  const fileAt = (path: string) => vault.getFileByPath(normalizePath(path));

  return Layer.succeed(VaultFiles)({
    exists: (path) => Effect.sync(() => fileAt(path) !== null),
    freePath: (folder, name, planned) =>
      Effect.map(plan(folder, name, planned), ({ path }) => path),
    write: (folder, name, bytes) =>
      Effect.flatMap(plan(folder, name), (planned) =>
        writeCommand(async () => {
          if (planned.folder !== "/" && vault.getFolderByPath(planned.folder) === null) {
            await vault.createFolder(planned.folder);
          }
          const copy = bytes.slice();
          await vault.createBinary(planned.path, copy.buffer);
          return Result.succeed(planned.path);
        }),
      ),
    resourceUrl: (path) =>
      Effect.sync(() => {
        const file = fileAt(path);
        return file === null ? undefined : vault.getResourcePath(file);
      }),
    open: (path) =>
      Effect.suspend(() => {
        const file = fileAt(path);
        if (file === null) return Effect.fail(new NoteNotFoundError());
        return Effect.tryPromise(openInTab(app, file));
      }),
  });
};

/** What the desktop app gives a plugin of Electron and Node, if anything. */
type DesktopRequire = (module: "electron" | "fs") => unknown;
type Electron = { readonly webUtils?: { getPathForFile(file: File): string } };
type FileSystem = { readonly promises: { unlink(path: string): Promise<void> } };

/** The path of a picked `File` on the desktop: Electron's `webUtils`, else the legacy `path`. */
const pathOf = (handle: unknown, load: DesktopRequire | undefined): string | undefined => {
  if (!(handle instanceof File) || load === undefined) return undefined;
  const electron = load("electron") as Electron;
  const path = electron.webUtils?.getPathForFile(handle) ?? (handle as { path?: string }).path;
  return path === undefined || path === "" ? undefined : path;
};

/**
 * The `LocalFiles` on Obsidian (PBI-11): only the desktop app can remove a picked file, through
 * Node's `fs`, and only one the system gives a path for; on mobile a move is not offered.
 */
export const localFilesLayer: Layer.Layer<LocalFiles> = Layer.sync(LocalFiles)(() => {
  const load = Platform.isDesktopApp
    ? ((window as { require?: DesktopRequire }).require ?? undefined)
    : undefined;
  return {
    movable: (file: PickedFile) => Effect.sync(() => pathOf(file.handle, load) !== undefined),
    remove: (file: PickedFile) =>
      Effect.tryPromise({
        try: async () => {
          const path = pathOf(file.handle, load);
          if (path === undefined || load === undefined) throw new Error("No path to remove.");
          await (load("fs") as FileSystem).promises.unlink(path);
        },
        catch: (cause) => new LocalFileRemoveError({ cause }),
      }),
  };
});
