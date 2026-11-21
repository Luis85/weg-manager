import { Events } from "./events";
import type { TFile, Vault } from "./vault";
import { parseYaml } from "./yaml";

type Loc = { readonly line: number; readonly col: number; readonly offset: number };
type Pos = { readonly start: Loc; readonly end: Loc };

/** The part of Obsidian's `CachedMetadata` the double fills. */
export type CachedMetadata = {
  readonly frontmatter?: Record<string, unknown>;
  readonly frontmatterPosition?: Pos;
};

/** A note's text split as Obsidian does: the YAML between the `---` lines, and the body after. */
export type SplitNote = { readonly yaml: string; readonly closing: number; readonly body: string };

const FRONTMATTER = /^---\n((?:[^]*?\n)?)---(?:\n|$)/;

export const splitFrontmatter = (text: string): SplitNote | undefined => {
  const match = FRONTMATTER.exec(text);
  if (match === null) return undefined;
  const yaml = match[1] ?? "";
  return { yaml, closing: 4 + yaml.length, body: text.slice(match[0].length) };
};

const indexOf = (text: string): CachedMetadata => {
  const split = splitFrontmatter(text);
  if (split === undefined) return {};
  let frontmatter: Record<string, unknown> | null;
  try {
    frontmatter = parseYaml(split.yaml);
  } catch {
    // Obsidian keeps a note with broken YAML without `frontmatter` and without its position.
    return {};
  }
  if (frontmatter === null) return {};
  const line = text.slice(0, split.closing).split("\n").length - 1;
  const end = { line, col: 3, offset: split.closing + 3 };
  return { frontmatter, frontmatterPosition: { start: { line: 0, col: 0, offset: 0 }, end } };
};

/**
 * Obsidian's metadata cache as 1.15.1 behaves (checked by `tests/e2e/specs/note-store.e2e.ts`):
 * a file is indexed a moment after its text changed (a macrotask later, never before the write's
 * promise resolves), and then `changed` fires. Until then `getFileCache` returns `null` for a new
 * file and the old metadata for a changed one. A rename keeps the cache and fires no `changed`;
 * a trashed file fires `deleted` before the vault's `delete`. `resolve` and `resolved` are not
 * modelled. `whenIndexed()` waits until every pending file is indexed.
 */
export class MetadataCache extends Events {
  private readonly caches = new Map<TFile, CachedMetadata>();
  private pending = 0;
  private idle: (() => void)[] = [];

  constructor(private readonly vault: Vault) {
    super();
    vault.indexer = (file) => {
      this.schedule(file);
    };
  }

  getFileCache(file: TFile): CachedMetadata | null {
    if (this.vault.failReads) throw new Error("metadata cache read failed");
    return this.vault.getFileByPath(file.path) === file ? (this.caches.get(file) ?? null) : null;
  }

  getCache(path: string): CachedMetadata | null {
    const file = this.vault.getFileByPath(path);
    return file === null ? null : this.getFileCache(file);
  }

  /** Resolves once every file written so far is indexed and its `changed` has fired. */
  whenIndexed(): Promise<void> {
    return new Promise((resolve) => {
      if (this.pending === 0) resolve();
      else this.idle.push(resolve);
    });
  }

  /** Double-internal: drops a trashed file's metadata and fires `deleted`. */
  forget(file: TFile): void {
    const previous = this.caches.get(file) ?? null;
    this.caches.delete(file);
    this.trigger("deleted", file, previous);
  }

  private schedule(file: TFile): void {
    this.pending += 1;
    setTimeout(() => {
      this.pending -= 1;
      if (this.vault.getFileByPath(file.path) === file) {
        const text = this.vault.textOf(file);
        const cache = indexOf(text);
        this.caches.set(file, cache);
        this.trigger("changed", file, text, cache);
      }
      if (this.pending === 0) {
        const waiting = this.idle;
        this.idle = [];
        for (const resolve of waiting) resolve();
      }
    }, 0);
  }
}
