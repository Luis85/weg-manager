import type { MetadataCache, TFile, Vault } from "obsidian";

/**
 * A check whether Obsidian's metadata cache holds an entry for every Markdown file in the vault,
 * which is when every file's frontmatter can be read from it. Obsidian has no public state for
 * this: `resolved` also fires while a cold start still indexes the rest, and never again for a
 * plugin enabled in a running app (tests/e2e/specs/vault-ready.e2e.ts). So the check asks the
 * cache, through the public API only.
 *
 * The first call scans every Markdown file and keeps the ones without an entry, in vault order.
 * Later calls go on from the first file still waiting and stop at the next one that is not indexed
 * yet, so a call on every `resolved` costs a few lookups, not a scan; if Obsidian indexes in
 * another order, the check only stops at that file a little longer. A file deleted meanwhile no
 * longer counts. Once nothing waits, one more scan catches files that appeared since; the cache is
 * complete only when that scan finds none.
 *
 * `missing()` is for a caller that gives up waiting: one scan that counts the Markdown files
 * without an entry right now, never their paths.
 */
export const cacheCompleteness = (vault: Vault, metadataCache: MetadataCache) => {
  let waiting: readonly TFile[] = [];
  let next = 0;
  const settled = (file: TFile): boolean =>
    metadataCache.getFileCache(file) !== null || vault.getFileByPath(file.path) !== file;
  const withoutEntry = (): TFile[] =>
    vault.getMarkdownFiles().filter((candidate) => metadataCache.getFileCache(candidate) === null);

  return {
    complete: (): boolean => {
      let file = waiting[next];
      while (file !== undefined && settled(file)) {
        next += 1;
        file = waiting[next];
      }
      if (file !== undefined) return false;
      waiting = withoutEntry();
      next = 0;
      return waiting.length === 0;
    },
    missing: (): number => withoutEntry().length,
  };
};
