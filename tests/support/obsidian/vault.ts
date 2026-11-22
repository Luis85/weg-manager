import type * as Obsidian from "obsidian";
import type { Uses } from "./conformance";
import { Events } from "./events";
import { normalizePath } from "./paths";

/** Obsidian's file tree node; `path` is vault-relative and changes when the file is renamed. */
export abstract class TAbstractFile implements Uses<Obsidian.TAbstractFile, "path" | "name"> {
  constructor(public path: string) {}

  get name(): string {
    return this.path.split("/").at(-1) ?? this.path;
  }
}

export class TFile
  extends TAbstractFile
  implements Uses<Obsidian.TFile, "path" | "name" | "basename" | "extension" | "stat">
{
  stat = { ctime: 0, mtime: 0, size: 0 };

  get extension(): string {
    const dot = this.name.lastIndexOf(".");
    return dot === -1 ? "" : this.name.slice(dot + 1);
  }

  get basename(): string {
    const dot = this.name.lastIndexOf(".");
    return dot === -1 ? this.name : this.name.slice(0, dot);
  }
}

export class TFolder
  extends TAbstractFile
  implements Uses<Obsidian.TFolder, "path" | "name" | "children" | "isRoot">
{
  /** The files and folders directly inside, kept up to date by the vault. */
  children: TAbstractFile[] = [];

  isRoot(): boolean {
    return this.path === "/";
  }
}

/** Where the double pretends the vault lies; Obsidian's own messages carry absolute paths too. */
const VAULT_ROOT = "/vault";

/**
 * What Node's `fs` rejects with on desktop, measured in Obsidian 1.15.1 for `process` on a file
 * deleted outside (`tests/support/notes/vanished-scenario.ts`): an `Error` with `code`, `errno`
 * and `syscall`.
 */
const enoent = (path: string, call = "open") =>
  Object.assign(new Error(`ENOENT: no such file or directory, ${call} '${VAULT_ROOT}/${path}'`), {
    errno: -2,
    code: "ENOENT",
    syscall: call,
  });

const eacces = (path: string) =>
  new Error(`EACCES: permission denied, open '${VAULT_ROOT}/${path}'`);

const eexist = (path: string) =>
  new Error(`EEXIST: file already exists, open '${VAULT_ROOT}/${path}'`);

/** How a case-insensitive, normalising file system (Windows, macOS) compares two names. */
const diskKey = (path: string) => path.normalize("NFC").toLowerCase();

const parentOf = (path: string): string => {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? "/" : path.slice(0, slash);
};

/** Holds writes until `release()`; `held()` counts the writes that wait. */
const gate = () => {
  let open = true;
  let waiting: (() => void)[] = [];
  return {
    wait: () =>
      new Promise<void>((resolve) => {
        if (open) resolve();
        else waiting.push(resolve);
      }),
    hold: () => {
      open = false;
    },
    release: () => {
      open = true;
      const queued = waiting;
      waiting = [];
      for (const resume of queued) resume();
    },
    held: () => waiting.length,
  };
};

/**
 * Obsidian's vault as 1.15.1 behaves (checked by `tests/e2e/specs/note-store.e2e.ts`): `create`
 * fires `create` before its promise resolves and refuses a taken path or a missing folder;
 * `createFolder` creates missing parents, one `create` each, parents first; `process` writes, and
 * fires `modify`, only when the text changes. Every content change is indexed by the metadata cache
 * a moment later. `read` drops a BOM, `process` hands its callback the raw text, BOM and CRLF
 * included, and rejects with ENOENT without calling back for a file deleted meanwhile; what the
 * callback throws rejects unchanged. Paths are vault-relative; the double refuses a path that `normalizePath` would
 * change, so an adapter that skips it fails here.
 *
 * A file deleted from outside Obsidian is gone from the disk at once and from the vault a moment
 * later, when its file watcher reports it: `vanish` is that moment, `remove` the report. Between
 * them the file is still listed, and `process` rejects with ENOENT.
 *
 * Test knobs: `failReads` (listing and the metadata cache throw), `failWrites` (every write
 * rejects without changing anything), `holdWrites`/`releaseWrites`/`heldWrites`,
 * `setMarkdownFileCount`, and `seedFile` for a file that appears from outside (Sync, another app),
 * also under a path that is not normalized.
 *
 * `caseInsensitive` models the disk of Windows and macOS: a write to a path that differs from
 * another entry only in case or Unicode form fails with EEXIST, and renaming a file to another case
 * of its own name works. Lookups stay exact, as the d.ts documents them ("case sensitive"), so an
 * adapter has to find such a clash itself.
 */
export class Vault
  extends Events
  implements
    Uses<
      Obsidian.Vault,
      | "getRoot"
      | "getAbstractFileByPath"
      | "getFileByPath"
      | "getFolderByPath"
      | "getFiles"
      | "getMarkdownFiles"
      | "read"
      | "cachedRead"
      | "create"
      | "createFolder"
      | "process"
      | "offref"
      | "trigger"
    >
{
  failReads = false;
  failWrites = false;
  caseInsensitive = false;
  readonly root = new TFolder("/");
  /** Double-internal: the metadata cache indexes each file whose text changed. */
  indexer: (file: TFile) => void = () => undefined;
  /** Double-internal: the metadata cache holds a file's metadata at once, as after a warm start. */
  indexedAtStartup: (file: TFile) => void = () => undefined;
  private readonly entries = new Map<string, TAbstractFile>();
  private readonly texts = new Map<TFile, string>();
  private readonly writes = gate();

  getRoot(): TFolder {
    return this.root;
  }

  getAbstractFileByPath(path: string): TAbstractFile | null {
    return path === "/" ? this.root : (this.entries.get(path) ?? null);
  }

  getFileByPath(path: string): TFile | null {
    const file = this.getAbstractFileByPath(path);
    return file instanceof TFile ? file : null;
  }

  getFolderByPath(path: string): TFolder | null {
    const folder = this.getAbstractFileByPath(path);
    return folder instanceof TFolder ? folder : null;
  }

  getFiles(): TFile[] {
    return [...this.entries.values()].filter((entry) => entry instanceof TFile);
  }

  getMarkdownFiles(): TFile[] {
    if (this.failReads) throw new Error("vault read failed");
    return this.getFiles().filter((file) => file.extension === "md");
  }

  /**
   * The text without a BOM, as Obsidian's `read` decodes it; `process` hands over the raw text. A
   * file gone from the disk rejects with ENOENT.
   */
  async read(file: TFile): Promise<string> {
    return this.textOf(file).replace(/^\uFEFF/, "");
  }

  cachedRead(file: TFile): Promise<string> {
    return this.read(file);
  }

  async create(path: string, data: string): Promise<TFile> {
    await this.beforeWrite(path);
    if (this.entries.has(path)) throw new Error("File already exists.");
    if (this.getFolderByPath(parentOf(path)) === null) throw enoent(path);
    if (this.collides(path)) throw eexist(path);
    const file = new TFile(path);
    this.link(file);
    this.texts.set(file, data);
    file.stat = { ctime: Date.now(), mtime: Date.now(), size: data.length };
    this.trigger("create", file);
    this.indexer(file);
    return file;
  }

  async createFolder(path: string): Promise<TFolder> {
    await this.beforeWrite(path);
    if (this.getAbstractFileByPath(path) !== null) throw new Error("Folder already exists.");
    const segments = path.split("/");
    let folder = this.root;
    for (let depth = 1; depth <= segments.length; depth += 1) {
      const prefix = segments.slice(0, depth).join("/");
      const existing = this.getAbstractFileByPath(prefix);
      if (existing instanceof TFolder) {
        folder = existing;
        continue;
      }
      if (existing !== null) throw new Error(`ENOTDIR: not a directory, mkdir '${prefix}'`);
      if (this.collides(prefix)) throw eexist(prefix);
      folder = new TFolder(prefix);
      this.link(folder);
      this.trigger("create", folder);
    }
    return folder;
  }

  async process(file: TFile, fn: (data: string) => string): Promise<string> {
    await this.beforeWrite(file.path);
    const next = fn(this.textOf(file));
    this.write(file, next);
    return next;
  }

  /**
   * Test helper: `count` empty notes at the vault root, as if they were there at startup: indexed,
   * without events.
   */
  setMarkdownFileCount(count: number): void {
    for (const file of this.getFiles()) {
      this.unlink(file);
      this.texts.delete(file);
    }
    for (let index = 0; index < count; index += 1) {
      const file = new TFile(`note-${index}.md`);
      this.link(file);
      this.texts.set(file, "");
      this.indexedAtStartup(file);
    }
  }

  /**
   * Test helper: a file written from outside Obsidian (a person, Sync, an agent) as Obsidian then
   * sees it: missing folders and the file appear with `create`, an existing file changes with
   * `modify`, and the metadata cache indexes it. No checks, no waiting, no failure knobs. A name
   * written in NFD (as macOS writes them) is listed in NFC, as Obsidian 1.15.1 lists it (measured
   * on Linux: the file keeps its NFD name on the disk, the vault knows it only in NFC).
   */
  seedFile(written: string, text: string): void {
    const path = written.normalize("NFC");
    const segments = path.split("/");
    for (let depth = 1; depth < segments.length; depth += 1) {
      const prefix = segments.slice(0, depth).join("/");
      if (this.getAbstractFileByPath(prefix) !== null) continue;
      const folder = new TFolder(prefix);
      this.link(folder);
      this.trigger("create", folder);
    }
    const existing = this.getFileByPath(path);
    if (existing !== null) {
      this.write(existing, text);
      return;
    }
    const file = new TFile(path);
    this.link(file);
    this.texts.set(file, text);
    this.trigger("create", file);
    this.indexer(file);
  }

  holdWrites(): void {
    this.writes.hold();
  }

  releaseWrites(): void {
    this.writes.release();
  }

  heldWrites(): number {
    return this.writes.held();
  }

  /** Double-internal: the text of a file on the disk, or `undefined` when the disk lost it. */
  onDisk(file: TFile): string | undefined {
    return this.texts.get(file);
  }

  /** Double-internal: the text of a file in the vault, or Obsidian's ENOENT. */
  textOf(file: TFile): string {
    const text = this.texts.get(file);
    if (text === undefined || this.entries.get(file.path) !== file) throw enoent(file.path);
    return text;
  }

  /**
   * Double-internal: waits while writes are held, then for the disk (a macrotask, so indexing that
   * is already due usually runs first; in Obsidian either order happens), then fails as a
   * read-only disk would.
   */
  async beforeWrite(path: string): Promise<void> {
    if (normalizePath(path) !== path) {
      throw new Error(`test double: path ${JSON.stringify(path)} is not normalized`);
    }
    await this.writes.wait();
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (this.failWrites) throw eacces(path);
  }

  /** Double-internal: replaces a file's text; `modify` and re-indexing only if it changed. */
  write(file: TFile, text: string): void {
    if (this.textOf(file) === text) return;
    this.texts.set(file, text);
    file.stat = { ...file.stat, mtime: Date.now(), size: text.length };
    this.trigger("modify", file);
    this.indexer(file);
  }

  /**
   * Double-internal: `fileManager.renameFile`. A folder moves with everything inside it: `rename`
   * fires for the folder, then for each entry inside in the vault's order, and each joins the
   * vault's order again, as in Obsidian. A folder's `children` keep their order.
   */
  move(entry: TAbstractFile, newPath: string): void {
    if (this.entries.get(entry.path) !== entry) throw enoent(entry.path, "rename");
    if (this.entries.has(newPath)) throw new Error("Destination file already exists!");
    if (this.getFolderByPath(parentOf(newPath)) === null) throw enoent(newPath, "rename");
    if (this.collides(newPath, entry)) throw eexist(newPath);
    const oldPath = entry.path;
    const inside = entry instanceof TFolder ? this.contentsOf(entry) : [];
    this.unlink(entry);
    entry.path = newPath;
    this.link(entry);
    const moved = inside.map((child) => {
      const old = child.path;
      this.entries.delete(old);
      child.path = `${newPath}${old.slice(oldPath.length)}`;
      this.entries.set(child.path, child);
      return [child, old] as const;
    });
    this.trigger("rename", entry, oldPath);
    for (const [child, old] of moved) this.trigger("rename", child, old);
  }

  /** Double-internal: the files and folders inside `folder`, in the vault's order. */
  contentsOf(folder: TFolder): TAbstractFile[] {
    return [...this.entries.values()].filter((entry) => entry.path.startsWith(`${folder.path}/`));
  }

  /**
   * Test helper: the file at `path` is deleted on the disk, outside Obsidian. The vault still
   * lists it, as Obsidian does until its file watcher reports the delete, and every read or write
   * of it rejects with ENOENT. No event fires; `remove` is the watcher's report.
   */
  vanish(path: string): void {
    const file = this.getFileByPath(path);
    if (file === null) throw new Error(`test double: no file at ${path}`);
    this.texts.delete(file);
  }

  /** Double-internal: removes one entry and fires `delete`. */
  remove(entry: TAbstractFile): void {
    if (this.entries.get(entry.path) !== entry) throw enoent(entry.path, "unlink");
    this.unlink(entry);
    if (entry instanceof TFile) this.texts.delete(entry);
    this.trigger("delete", entry);
  }

  /** On a case-insensitive disk: another entry already holds `path` in another case or form. */
  private collides(path: string, except?: TAbstractFile): boolean {
    if (!this.caseInsensitive) return false;
    const key = diskKey(path);
    return [...this.entries.values()].some(
      (entry) => entry !== except && diskKey(entry.path) === key,
    );
  }

  private link(entry: TAbstractFile): void {
    this.entries.set(entry.path, entry);
    this.getFolderByPath(parentOf(entry.path))?.children.push(entry);
  }

  private unlink(entry: TAbstractFile): void {
    this.entries.delete(entry.path);
    const parent = this.getFolderByPath(parentOf(entry.path));
    if (parent !== null) parent.children = parent.children.filter((child) => child !== entry);
  }
}
