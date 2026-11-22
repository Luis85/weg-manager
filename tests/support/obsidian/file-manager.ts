import type * as Obsidian from "obsidian";
import type { Uses } from "./conformance";
import type { MetadataCache } from "./metadata-cache";
import { isMap, splitFrontmatter } from "./metadata-cache";
import { TFile, TFolder, type TAbstractFile, type Vault } from "./vault";
import { parseYaml, stringifyYaml } from "./yaml";

/**
 * Obsidian's file manager as 1.15.1 behaves (checked by `tests/e2e/specs/note-store.e2e.ts`):
 *
 * - `processFrontMatter` parses the YAML from the file's text (not from the cache), hands `fn` the
 *   map (`{}` without frontmatter), and writes back only when the text changes: no-op calls fire
 *   nothing. A thrown error, also a `YAMLParseError` of broken YAML, writes nothing. With every key
 *   deleted the `---` block goes and only the body stays. The body is never touched.
 * - `renameFile` refuses a taken path (`Destination file already exists!`) and a missing folder
 *   (ENOENT), keeps the `TFile` and `TFolder` objects and fires `rename` with the old path: for a
 *   folder the folder first, then everything inside it in the vault's order. A moment after the
 *   move, the metadata cache fires one `resolved`. The move runs as Obsidian's link update
 *   (`runAsyncLinkUpdate` below): after the cache has indexed every earlier write, one at a time,
 *   and a rename asked for during another one's move resolves before its own move. Link updates
 *   in other notes, and the `changed` they would cause, are not modelled.
 * - `trashFile` fires, for each file, the metadata cache's `deleted` and the vault's `delete`, for
 *   a folder its contents in the vault's order and the folder last; once the promise has resolved
 *   (with `true`, although the d.ts says `Promise<void>`), one `resolved`. Which trash the user
 *   chose makes no difference to that, except that with "system" (the default) it first asks
 *   `vault.adapter.trashSystem`: when that answers `false`, nothing is deleted, no event fires and
 *   the promise resolves `false`, without rejecting (`trash-failure-scenario.ts`; Obsidian also
 *   shows its own notice, which the double leaves out).
 *
 * "The vault's order" is the order entries joined the vault, a renamed entry joining again: that
 * is how Obsidian 1.15.1 lists them (`vaultFacts`' `trashFolder`, `folderScenario`).
 */
// `trashFile` resolves with `true` (measured), while the d.ts says `Promise<void>`: left out.
export class FileManager implements Uses<
  Obsidian.FileManager,
  "renameFile" | "processFrontMatter"
> {
  /** The link updates in turn; each waits for the one before, settled either way. */
  private linkUpdates: Promise<void> = Promise.resolve();
  /** While a link update moves its files: the renames that joined it. */
  private joining: (() => Promise<void>)[] | null = null;

  constructor(
    private readonly vault: Vault,
    private readonly metadataCache: MetadataCache,
  ) {}

  async processFrontMatter(
    file: TFile,
    fn: (frontmatter: Record<string, unknown>) => void,
  ): Promise<void> {
    await this.vault.beforeWrite(file.path);
    const text = this.vault.textOf(file);
    const split = splitFrontmatter(text);
    const parsed: unknown = split === undefined ? {} : parseYaml(split.yaml);
    // Not measured for YAML that is no map; the plugin no longer calls this.
    const frontmatter = isMap(parsed) ? parsed : {};
    fn(frontmatter);
    const body = split === undefined ? text : split.body;
    const yaml = Object.keys(frontmatter).length === 0 ? "" : stringifyYaml(frontmatter);
    const next = yaml === "" ? body : `---\n${yaml}---\n${body}`;
    this.vault.write(file, next);
    this.vault.keep(file, next);
  }

  async renameFile(file: TAbstractFile, newPath: string): Promise<void> {
    await this.runAsyncLinkUpdate(async () => {
      await this.vault.beforeWrite(newPath);
      this.vault.move(file, newPath);
      this.resolvedLater();
    });
  }

  /**
   * Obsidian 1.15.1's `runAsyncLinkUpdate`, which `renameFile` runs the move through: one link
   * update at a time, in a queue, each first waiting until the metadata cache has indexed every
   * write so far (`onCleanCache`). A rename asked for while another update is moving its files
   * (from a `rename` listener, say) is not queued: it joins that update, which moves it after
   * its own, and its promise resolves at once, before the move; what that move rejects with
   * reaches the caller of the first update, not its own (`orderScenario`'s overlapping renames).
   */
  private runAsyncLinkUpdate(update: () => Promise<void>): Promise<void> {
    if (this.joining !== null) {
      this.joining.push(update);
      return Promise.resolve();
    }
    const run = async () => {
      await this.metadataCache.whenIndexed();
      try {
        this.joining = [];
        await update();
        while (this.joining.length > 0) {
          const joined = this.joining;
          this.joining = [];
          // oxlint-disable-next-line no-await-in-loop -- each batch joined the one before it
          await Promise.all(joined.map((move) => move()));
        }
      } finally {
        this.joining = null;
      }
    };
    const next = this.linkUpdates.then(run, run);
    this.linkUpdates = next;
    return next;
  }

  async trashFile(file: TAbstractFile): Promise<boolean> {
    await this.vault.beforeWrite(file.path);
    if (file instanceof TFile) this.vault.textOf(file);
    else if (this.vault.getAbstractFileByPath(file.path) !== file) throw new Error("ENOENT");
    if (
      this.vault.getConfig("trashOption") === "system" &&
      !(await this.vault.adapter.trashSystem(file.path))
    ) {
      return false;
    }
    const entries = file instanceof TFolder ? [...this.vault.contentsOf(file), file] : [file];
    for (const entry of entries) {
      if (entry instanceof TFile) this.metadataCache.forget(entry);
      this.vault.remove(entry);
    }
    this.resolvedLater();
    return true;
  }

  /** The `resolved` Obsidian fires a moment after a rename or a trash has resolved. */
  private resolvedLater(): void {
    setTimeout(() => {
      this.metadataCache.trigger("resolved");
    }, 0);
  }
}
