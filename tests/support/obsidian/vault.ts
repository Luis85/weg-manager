import { Events } from "./events";

/** Obsidian's file tree node; `path` is vault-relative. */
export abstract class TAbstractFile {
  constructor(readonly path: string) {}

  get name(): string {
    return this.path.split("/").at(-1) ?? this.path;
  }
}

export class TFile extends TAbstractFile {
  get extension(): string {
    const dot = this.name.lastIndexOf(".");
    return dot === -1 ? "" : this.name.slice(dot + 1);
  }

  get basename(): string {
    const dot = this.name.lastIndexOf(".");
    return dot === -1 ? this.name : this.name.slice(0, dot);
  }
}

export class TFolder extends TAbstractFile {}

/** Emits `create`, `modify`, `delete` and `rename` like Obsidian's vault (through `trigger`). */
export class Vault extends Events {
  files: TFile[] = [];
  failReads = false;

  getMarkdownFiles(): TFile[] {
    if (this.failReads) throw new Error("vault read failed");
    return this.files.filter((file) => file.extension === "md");
  }

  /** Test helper. */
  setMarkdownFileCount(count: number): void {
    this.files = Array.from({ length: count }, (_, index) => new TFile(`note-${index}.md`));
  }
}

/** Emits `changed` like Obsidian's metadata cache. */
export class MetadataCache extends Events {}
