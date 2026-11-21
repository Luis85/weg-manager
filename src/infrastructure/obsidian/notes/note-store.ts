import { Effect, Layer, Result } from "effect";
import { normalizePath, stringifyYaml, type App, type Plugin, type TFile } from "obsidian";
import {
  NoteNotFoundError,
  NoteStore,
  NoteUnreadableError,
  applyPatch,
  copyFrontmatter,
  createNote,
  recordNotes,
  planRename,
  writeCommand,
  type FrontmatterChange,
  type NewNote,
  type Note,
  type NotesServices,
} from "../../../application/notes";
import { VaultReadError } from "../../../application/shell";
import { randomIdGeneratorLayer } from "./id-generator";

/** Obsidian's parser throws this when a note's YAML is broken. */
const isYamlError = (cause: unknown): boolean =>
  cause instanceof Error && cause.name === "YAMLParseError";

const vaultRead = <A>(read: () => A) =>
  Effect.try({ try: read, catch: (cause) => new VaultReadError({ cause }) });

/** A new note's text: the frontmatter as Obsidian writes YAML, then the body. */
const noteText = (frontmatter: Readonly<Record<string, unknown>>, body: string): string =>
  Object.keys(frontmatter).length === 0 ? body : `---\n${stringifyYaml(frontmatter)}---\n${body}`;

/**
 * The `NoteStore` on Obsidian (ADR 0007): the only code that changes vault files. It reads
 * frontmatter from the metadata cache and writes only through `vault.create`,
 * `vault.createFolder`, `fileManager.processFrontMatter`, `fileManager.trashFile` and
 * `fileManager.renameFile`, every path through `normalizePath`. No `vault.modify`, no
 * `vault.adapter`.
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
      await vault.create(path, noteText(frontmatter, body));
    });

  /**
   * `change` decides inside `processFrontMatter`, on the frontmatter Obsidian has just read from
   * the file. To abort, the callback throws, so Obsidian writes nothing; `refusal` keeps why.
   */
  const update = <E>(path: string, change: FrontmatterChange<E>) =>
    Effect.flatMap(find(path), (file) => {
      let refusal: Result.Result<never, E> | undefined;
      let written: Note = { path: file.path, frontmatter: {} };
      return writeCommand(async (): Promise<Result.Result<Note, E | NoteUnreadableError>> => {
        try {
          await fileManager.processFrontMatter(file, (frontmatter: Record<string, unknown>) => {
            const decided = change(copyFrontmatter(frontmatter));
            if (Result.isFailure(decided)) {
              refusal = Result.fail(decided.failure);
              throw new Error("change refused");
            }
            applyPatch(frontmatter, decided.success);
            written = { path: file.path, frontmatter: copyFrontmatter(frontmatter) };
          });
        } catch (cause) {
          if (refusal !== undefined) return refusal;
          if (isYamlError(cause)) return Result.fail(new NoteUnreadableError({ cause }));
          throw cause;
        }
        return Result.succeed(written);
      });
    });

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

/** The notes module's services for one plugin load. */
export const notesLayer = (plugin: Plugin): Layer.Layer<NotesServices> =>
  Layer.merge(noteStoreLayer(plugin.app), randomIdGeneratorLayer);
