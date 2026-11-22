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

/** `fileManager.processFrontMatter`'s reading (`getFrontMatterInfo`): no BOM, exact fences. */
const FRONTMATTER = /^---\r?\n((?:[^]*?\n)?)---(?:\r?\n|$)/;

/**
 * The metadata cache's reading, as measured in Obsidian 1.15.1: past one BOM (`vault.read` drops
 * it), and the block closes at the first line that starts with `---` (`----` too).
 */
const CACHED_FRONTMATTER = /^---\r?\n((?:[^]*?\n)?)---[^\n]*(?:\n|$)/;

const cut = (pattern: RegExp, text: string): SplitNote | undefined => {
  const match = pattern.exec(text);
  if (match === null) return undefined;
  const yaml = match[1] ?? "";
  const closing = match[0].indexOf("\n") + 1 + yaml.length;
  return { yaml, closing, body: text.slice(match[0].length) };
};

export const splitFrontmatter = (text: string): SplitNote | undefined => cut(FRONTMATTER, text);

const indexOf = (raw: string): CachedMetadata => {
  const text = raw.startsWith("\uFEFF") ? raw.slice(1) : raw;
  const found = cut(CACHED_FRONTMATTER, text);
  if (found === undefined) return {};
  const line = text.slice(0, found.closing).split("\n").length - 1;
  const position = {
    start: { line: 0, col: 0, offset: 0 },
    end: { line, col: 3, offset: found.closing + 3 },
  };
  // Obsidian lists the block as a `yaml` section whether or not it can read it.
  const sections = [{ type: "yaml", position }];
  let frontmatter: Record<string, unknown> | null;
  try {
    frontmatter = parseYaml(found.yaml);
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
  private readonly withheld = new Set<string>();
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

  /**
   * Test helper: Obsidian never gets to the file at `path`: it has no cache entry and fires no
   * `changed`, `resolve` or `resolved` for it, whatever happens to it, until `restoreIndex`.
   * Obsidian 1.15.1 did this for no file a reviewer could build (null bytes, a binary `.md`,
   * 30 MB, excluded files, symlinks, an unreadable file all got an entry), so it is a state the
   * host adapter has to survive, not one Obsidian is known to reach.
   */
  withholdIndex(path: string): void {
    this.withheld.add(path);
  }

  /** Test helper: Obsidian gets to a withheld file after all, as it does after a change. */
  restoreIndex(path: string): void {
    this.withheld.delete(path);
    const file = this.vault.getFileByPath(path);
    if (file !== null) this.schedule(file);
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
    if (this.vault.getFileByPath(file.path) === file && !this.withheld.has(file.path)) {
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
