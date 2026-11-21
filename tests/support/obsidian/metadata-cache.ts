import { Events } from "./events";
import type { TFile, Vault } from "./vault";
import { parseYaml } from "./yaml";

type Loc = { readonly line: number; readonly col: number; readonly offset: number };
type Pos = { readonly start: Loc; readonly end: Loc };

/** One block of a note; the double knows only the frontmatter block (`yaml`). */
export type SectionCache = { readonly type: string; readonly position: Pos };

/** The part of Obsidian's `CachedMetadata` the double fills. */
export type CachedMetadata = {
  readonly frontmatter?: Record<string, unknown>;
  readonly frontmatterPosition?: Pos;
  readonly sections?: readonly SectionCache[];
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
  const line = text.slice(0, split.closing).split("\n").length - 1;
  const position = {
    start: { line: 0, col: 0, offset: 0 },
    end: { line, col: 3, offset: split.closing + 3 },
  };
  // Obsidian lists the block as a `yaml` section whether or not it can read it.
  const sections = [{ type: "yaml", position }];
  let frontmatter: Record<string, unknown> | null;
  try {
    frontmatter = parseYaml(split.yaml);
  } catch {
    // Obsidian keeps a note with broken YAML without `frontmatter` and without its position.
    return { sections };
  }
  if (frontmatter === null) return { sections };
  return { frontmatter, frontmatterPosition: position, sections };
};

/**
 * Obsidian's metadata cache as 1.15.1 behaves (checked by `tests/e2e/specs/note-store.e2e.ts` and
 * `vault-ready.e2e.ts`): a file is indexed a moment after its text changed (a macrotask later,
 * never before the write's promise resolves), and then `changed`, `resolve` and `resolved` fire in
 * that order. Until then `getFileCache` returns `null` for a new file and the old metadata for a
 * changed one. A rename keeps the cache and fires no `changed`; a trashed file fires `deleted`,
 * then the vault's `delete`, then `resolved`. `whenIndexed()` waits until every pending file is
 * indexed.
 *
 * Startup, as measured on the F-21 reference vault (docs/engineering/testing.md):
 * - Files the vault holds are indexed already: a warm cache, or a plugin enabled in a running app.
 *   After a warm restart Obsidian fires `resolve` for every file and one `resolved`, shortly after
 *   the layout is ready: `resolveAll()`.
 * - `startCold()` is a vault Obsidian has never indexed: every file loses its metadata and is
 *   indexed again, one per macrotask. As in Obsidian, `resolved` fires after each file, also
 *   while others still wait, so `resolved` alone does not mean the cache is complete.
 *
 * Obsidian exposes no "resolved" state; a caller sees completeness only through `getFileCache`.
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
    vault.indexedAtStartup = (file) => {
      this.caches.set(file, indexOf(vault.textOf(file)));
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

  /**
   * Test helper: a vault Obsidian has never indexed. Every Markdown file loses its metadata, without
   * an event, and is indexed again in vault order, each in its own macrotask once the one before
   * it is done, so a test can act between two files.
   */
  startCold(): void {
    this.caches.clear();
    const files = this.vault.getMarkdownFiles();
    this.pending += files.length;
    const next = (index: number): void => {
      const file = files[index];
      if (file === undefined) return;
      setTimeout(() => {
        this.index(file);
        next(index + 1);
      }, 0);
    };
    next(0);
  }

  /**
   * Test helper: what a warm restart fires once the layout is ready: `resolve` for every Markdown
   * file, then one `resolved`.
   */
  resolveAll(): void {
    for (const file of this.vault.getMarkdownFiles()) this.trigger("resolve", file);
    this.trigger("resolved");
  }

  private schedule(file: TFile): void {
    this.pending += 1;
    setTimeout(() => {
      this.index(file);
    }, 0);
  }

  /** Indexes a file that is still in the vault, then wakes `whenIndexed` once nothing is pending. */
  private index(file: TFile): void {
    this.pending -= 1;
    if (this.vault.getFileByPath(file.path) === file) {
      const text = this.vault.textOf(file);
      const cache = indexOf(text);
      this.caches.set(file, cache);
      this.trigger("changed", file, text, cache);
      this.trigger("resolve", file);
      this.trigger("resolved");
    }
    if (this.pending === 0) {
      const waiting = this.idle;
      this.idle = [];
      for (const resolve of waiting) resolve();
    }
  }
}
