import { Effect, Layer, Result } from "effect";
import { normalizePath, parseYaml, type App, type CachedMetadata, type TFile } from "obsidian";
import {
  NoteNotFoundError,
  NoteStore,
  asDefect,
  copyFrontmatter,
  createNote,
  newNoteText,
  pathsInFolder,
  recordNotes,
  planRename,
  updateNoteText,
  writeCommand,
  type FrontmatterChange,
  type NewNote,
  type Note,
  type NoteUnreadableError,
  type NoteWriteRefusedError,
} from "../../../application/notes";
import { VaultReadError } from "../../../application/shell";

/** How an update fails besides the change's own failure and a failed write (`NoteWriteError`). */
type UpdateError = NoteNotFoundError | NoteUnreadableError | NoteWriteRefusedError;

const vaultRead = <A>(read: () => A) =>
  Effect.try({ try: read, catch: (cause) => new VaultReadError({ cause }) });

/**
 * True when the cache shows a frontmatter block it could not read. Measured in Obsidian 1.15.1
 * (`tests/support/notes/fidelity.ts`): broken YAML, and YAML that is no map, leave no
 * `frontmatter` and no `frontmatterPosition`, but the block stays a `yaml` section; a note
 * without a block has none. A block of two fences holds nothing to read and does not count.
 */
const hasUnreadableFrontmatter = (cache: CachedMetadata | null): boolean => {
  if (cache === null || cache.frontmatter !== undefined) return false;
  const block = cache.sections?.find((section) => section.type === "yaml");
  return block !== undefined && block.position.end.line > block.position.start.line + 1;
};

/**
 * The `NoteStore` on Obsidian (ADR 0007): the only code that changes vault files. It reads
 * frontmatter from the metadata cache and writes only through `vault.create`,
 * `vault.createFolder`, `vault.process`, `fileManager.trashFile` and `fileManager.renameFile`,
 * every path through `normalizePath`. No `vault.modify`, no `vault.adapter`, and no
 * `fileManager.processFrontMatter`: it parses and rewrites the whole block, so comments, quoting
 * and number forms (`01067`, `1.10`) of keys the plugin does not know would change. An update
 * edits the file's text line by line instead (`updateNoteText`).
 */
const obsidianNoteStore = (app: App): NoteStore["Service"] => {
  const { vault, metadataCache, fileManager } = app;

  /** Obsidian's lookups are case-sensitive (d.ts), so clashes are found among the children. */
  const siblingsOf = (folder: string) =>
    (folder === "/" ? vault.getRoot() : vault.getFolderByPath(folder))?.children.map(
      (child) => child.path,
    ) ?? [];

  const frontmatterOf = (file: TFile) =>
    copyFrontmatter(metadataCache.getFileCache(file)?.frontmatter);

  const find = (path: string) =>
    Effect.suspend(() => {
      const file = vault.getFileByPath(normalizePath(path));
      return file !== null && file.extension === "md"
        ? Effect.succeed(file)
        : Effect.fail(new NoteNotFoundError());
    });

  const create = (note: NewNote) =>
    createNote(note, normalizePath, siblingsOf, async ({ folder, path, frontmatter }, body) => {
      if (folder !== "/" && vault.getFolderByPath(folder) === null) {
        await vault.createFolder(folder);
      }
      await vault.create(
        path,
        asDefect(() => newNoteText(frontmatter, body)),
      );
    });

  /**
   * `change` decides inside `vault.process`, on the frontmatter parsed from the text Obsidian has
   * just read from the file, and only lines of keys the patch changes are rewritten. Returning the
   * text unchanged writes nothing. A note deleted after `find` makes `vault.process` reject
   * (ENOENT) without calling back: that is `NoteNotFoundError`, not a write to retry.
   */
  const update = <E>(path: string, change: FrontmatterChange<E>) =>
    Effect.flatMap(find(path), (file) =>
      writeCommand(async (): Promise<Result.Result<Note, E | UpdateError>> => {
        const decided: { outcome?: ReturnType<typeof updateNoteText<E>> } = {};
        try {
          await vault.process(file, (text) => {
            const outcome = asDefect(() => updateNoteText(text, change, parseYaml));
            decided.outcome = outcome;
            return Result.isSuccess(outcome) ? outcome.success.text : text;
          });
        } catch (cause) {
          if (decided.outcome === undefined && vault.getFileByPath(file.path) !== file) {
            return Result.fail(new NoteNotFoundError());
          }
          throw cause;
        }
        if (decided.outcome === undefined) throw new Error("vault.process did not call back");
        return Result.map(decided.outcome, ({ frontmatter }): Note => ({
          path: file.path,
          frontmatter,
        }));
      }),
    );

  const trash = (path: string) =>
    Effect.flatMap(find(path), (file) =>
      writeCommand(async () => {
        // Obsidian 1.15 resolves with `true` although its d.ts says `void`; the port promises void.
        await fileManager.trashFile(file);
        return Result.succeed(undefined);
      }),
    );

  const rename = (path: string, newName: string) =>
    Effect.gen(function* () {
      const file = yield* find(path);
      const target = yield* planRename(file.path, newName, normalizePath, siblingsOf);
      if (target === file.path) return { path: target, frontmatter: frontmatterOf(file) };
      return yield* writeCommand(async () => {
        await fileManager.renameFile(file, target);
        return Result.succeed<Note>({ path: file.path, frontmatter: frontmatterOf(file) });
      });
    });

  return NoteStore.of({
    list: vaultRead(() =>
      recordNotes(
        vault.getMarkdownFiles().map((file) => ({
          path: file.path,
          frontmatter: metadataCache.getFileCache(file)?.frontmatter,
        })),
      ),
    ),
    unreadable: (folder) =>
      vaultRead(() =>
        pathsInFolder(
          vault
            .getMarkdownFiles()
            .filter((file) => hasUnreadableFrontmatter(metadataCache.getFileCache(file)))
            .map((file) => file.path),
          normalizePath(folder),
        ),
      ),
    read: (path) =>
      Effect.flatMap(find(path), (file) =>
        vaultRead(() => ({ path: file.path, frontmatter: frontmatterOf(file) })),
      ),
    create,
    update,
    trash,
    rename,
  });
};

/** The Obsidian `NoteStore` of `app` as a Layer; the e2e probe plugin builds it the same way. */
export const noteStoreLayer = (app: App): Layer.Layer<NoteStore> =>
  Layer.succeed(NoteStore)(obsidianNoteStore(app));
