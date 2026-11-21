import type { MetadataCache } from "./metadata-cache";
import { splitFrontmatter } from "./metadata-cache";
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
 *   (ENOENT), keeps the `TFile` object and fires `rename` with the old path. Link updates in other
 *   notes are not modelled, and folders cannot be renamed here.
 * - `trashFile` fires, for each file, the metadata cache's `deleted` and then the vault's `delete`,
 *   the folder's own `delete` last. Which trash the user chose makes no difference to that. It
 *   resolves with `true`, although the d.ts says `Promise<void>`.
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
    const frontmatter = split === undefined ? {} : (parseYaml(split.yaml) ?? {});
    fn(frontmatter);
    const body = split === undefined ? text : split.body;
    const yaml = Object.keys(frontmatter).length === 0 ? "" : stringifyYaml(frontmatter);
    this.vault.write(file, yaml === "" ? body : `---\n${yaml}---\n${body}`);
  }

  async renameFile(file: TAbstractFile, newPath: string): Promise<void> {
    await this.vault.beforeWrite(newPath);
    if (!(file instanceof TFile)) throw new Error("test double: only files can be renamed");
    this.vault.move(file, newPath);
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
    return true;
  }
}
