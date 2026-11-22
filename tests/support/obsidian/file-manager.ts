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
 *   folder the folder first, then everything inside it in the vault's order. Once the promise has
 *   resolved, the metadata cache fires one `resolved`. Link updates in other notes, and the
 *   `changed` they would cause, are not modelled.
 * - `trashFile` fires, for each file, the metadata cache's `deleted` and the vault's `delete`, for
 *   a folder its contents in the vault's order and the folder last; once the promise has resolved
 *   (with `true`, although the d.ts says `Promise<void>`), one `resolved`. Which trash the user
 *   chose makes no difference to that.
 *
 * "The vault's order" is the order entries joined the vault, a renamed entry joining again: that
 * is how Obsidian 1.15.1 lists them (`vaultFacts`' `trashFolder`, `folderScenario`).
 */
export class FileManager {
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
    this.vault.write(file, yaml === "" ? body : `---\n${yaml}---\n${body}`);
  }

  async renameFile(file: TAbstractFile, newPath: string): Promise<void> {
    await this.vault.beforeWrite(newPath);
    this.vault.move(file, newPath);
    this.resolvedLater();
  }

  async trashFile(file: TAbstractFile): Promise<boolean> {
    await this.vault.beforeWrite(file.path);
    if (file instanceof TFile) this.vault.textOf(file);
    else if (this.vault.getAbstractFileByPath(file.path) !== file) throw new Error("ENOENT");
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
