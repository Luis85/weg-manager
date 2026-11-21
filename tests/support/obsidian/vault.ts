import { Events } from "./events";
import { normalizePath } from "./paths";

/** Obsidian's file tree node; `path` is vault-relative and changes when the file is renamed. */
export abstract class TAbstractFile {
  constructor(public path: string) {}

  get name(): string {
    return this.path.split("/").at(-1) ?? this.path;
  }
}

export class TFile extends TAbstractFile {
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

export class TFolder extends TAbstractFile {
  isRoot(): boolean {
    return this.path === "/";
  }
}

/** Where the double pretends the vault lies; Obsidian's own messages carry absolute paths too. */
const VAULT_ROOT = "/vault";

const enoent = (path: string, call = "open") =>
  new Error(`ENOENT: no such file or directory, ${call} '${VAULT_ROOT}/${path}'`);

const eacces = (path: string) =>
  new Error(`EACCES: permission denied, open '${VAULT_ROOT}/${path}'`);

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
 * a moment later. Paths are vault-relative; the double refuses a path that `normalizePath` would
 * change, so an adapter that skips it fails here.
 *
 * Test knobs: `failReads` (listing and the metadata cache throw), `failWrites` (every write
 * rejects without changing anything), `holdWrites`/`releaseWrites`/`heldWrites`,
 * `setMarkdownFileCount`.
 */
export class Vault extends Events {
  failReads = false;
  failWrites = false;
  readonly root = new TFolder("/");
  /** Double-internal: the metadata cache indexes each file whose text changed. */
  indexer: (file: TFile) => void = () => undefined;
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

  read(file: TFile): Promise<string> {
    return Promise.resolve(this.textOf(file));
  }

  cachedRead(file: TFile): Promise<string> {
    return this.read(file);
  }

  async create(path: string, data: string): Promise<TFile> {
    await this.beforeWrite(path);
    if (this.entries.has(path)) throw new Error("File already exists.");
    if (this.getFolderByPath(parentOf(path)) === null) throw enoent(path);
    const file = new TFile(path);
    this.entries.set(path, file);
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
      folder = new TFolder(prefix);
      this.entries.set(prefix, folder);
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

  /** Test helper: `count` empty notes at the vault root, as if they were there at startup. */
  setMarkdownFileCount(count: number): void {
    for (const file of this.getFiles()) {
      this.entries.delete(file.path);
      this.texts.delete(file);
    }
    for (let index = 0; index < count; index += 1) {
      const file = new TFile(`note-${index}.md`);
      this.entries.set(file.path, file);
      this.texts.set(file, "");
    }
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

  /** Double-internal: `fileManager.renameFile` for a file. */
  move(file: TFile, newPath: string): void {
    if (this.entries.get(file.path) !== file) throw enoent(file.path, "rename");
    if (this.entries.has(newPath)) throw new Error("Destination file already exists!");
    if (this.getFolderByPath(parentOf(newPath)) === null) throw enoent(newPath, "rename");
    const oldPath = file.path;
    this.entries.delete(oldPath);
    file.path = newPath;
    this.entries.set(newPath, file);
    this.trigger("rename", file, oldPath);
  }

  /** Double-internal: the files and folders inside `folder`, deepest first. */
  contentsOf(folder: TFolder): TAbstractFile[] {
    return [...this.entries.values()]
      .filter((entry) => entry.path.startsWith(`${folder.path}/`))
      .toSorted((a, b) => b.path.split("/").length - a.path.split("/").length);
  }

  /** Double-internal: removes one entry and fires `delete`. */
  remove(entry: TAbstractFile): void {
    if (this.entries.get(entry.path) !== entry) throw enoent(entry.path, "unlink");
    this.entries.delete(entry.path);
    if (entry instanceof TFile) this.texts.delete(entry);
    this.trigger("delete", entry);
  }
}
