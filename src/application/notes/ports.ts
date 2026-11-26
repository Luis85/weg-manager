// Stryker disable StringLiteral: the only string here is a service key; it only has to be unique and tests cannot observe its text.
import { Context, type Effect, type Result } from "effect";
import type { Frontmatter, FrontmatterPatch } from "../../domain/notes";
import type { VaultReadError } from "../shell";
import type {
  InvalidNoteNameError,
  LocalFileRemoveError,
  NoteNotFoundError,
  NoteOpenError,
  NotePathTakenError,
  NoteTrashError,
  NoteUnreadableError,
  NoteWriteError,
  NoteWriteRefusedError,
} from "./errors";

// One definition of each, in the domain; the port speaks it.
export type { Frontmatter, FrontmatterPatch } from "../../domain/notes";

/**
 * A note as the store hands it out: its vault path and a copy of its frontmatter. The frontmatter is
 * also how a caller detects a change: a later read that differs per field is a change (ADR 0007),
 * whatever else happened to the file.
 */
export type Note = { readonly path: string; readonly frontmatter: Frontmatter };

/**
 * An edit of a note's body, in the same atomic write as its frontmatter (ADR 0007, amendment
 * 26.11.2026): it gets the body as the file holds it now and the note's line break, and returns
 * the new body. Pure; a type's contract says which section of the body it may change.
 */
export type BodyEdit = (body: string, eol: string) => string;

export type NewNote = {
  /** Vault folder, created with its parents when missing; `""` or `"/"` is the vault root. */
  readonly folder: string;
  /** File name without `.md`. A taken name gets ` (2)`, ` (3)`, … */
  readonly name: string;
  readonly frontmatter: Frontmatter;
  readonly body?: string;
};

/**
 * Decides an update from the note's current frontmatter, inside the atomic write: a patch to write,
 * or a typed failure that aborts the write. Synchronous, because Obsidian's write is.
 */
export type FrontmatterChange<E> = (current: Frontmatter) => Result.Result<FrontmatterPatch, E>;

/**
 * Vault notes as plain data (ADR 0007). Reads come from Obsidian's metadata cache, which catches up
 * with a write a moment after it: a read right after a write may still see the old frontmatter, so
 * every write returns the note as written. Writes are commands: once the vault call has started,
 * they complete, also when the caller is interrupted. Every path goes through `normalizePath`.
 */
export class NoteStore extends Context.Service<
  NoteStore,
  {
    /** Every record in the vault (frontmatter `schema` starts with `weg-manager.`), by path. */
    readonly list: Effect.Effect<readonly Note[], VaultReadError>;
    /** The note at `path`; a note without frontmatter, or whose YAML is broken, has `{}`. */
    read(path: string): Effect.Effect<Note, NoteNotFoundError | VaultReadError>;
    /**
     * The note's body as the file holds it now (not a cached copy): the text after its
     * frontmatter block, or the whole text when it has none.
     */
    readBody(path: string): Effect.Effect<string, NoteNotFoundError | VaultReadError>;
    /**
     * The paths of the Markdown notes in `folder` or below (`/` is the whole vault) whose
     * frontmatter block cannot be read: broken YAML, or YAML that is no map. `list` leaves them
     * out and `read` gives `{}`, so this is the only way to find them. Sorted by path. The folder
     * is found as `create` finds it.
     */
    unreadable(folder: string): Effect.Effect<readonly string[], VaultReadError>;
    /**
     * Writes a new note into `note.folder`, found segment by segment regardless of case and
     * Unicode form (`clashKey`) and written in the vault's spelling: the folder spelled exactly as
     * asked, else the first by code unit; what is missing is created as asked. A taken name gets
     * ` (2)`, ` (3)`, …, compared by `clashKey` too.
     */
    create(
      note: NewNote,
    ): Effect.Effect<Note, InvalidNoteNameError | NotePathTakenError | NoteWriteError>;
    /**
     * Runs `change` on the current frontmatter inside one atomic write; the body is untouched,
     * unless `body` edits it in the same write. What `change` or `body` throws is a defect. The Obsidian adapter changes only the lines of the keys
     * the patch changes and refuses (`NoteWriteRefusedError`, `layout`) a note it cannot edit so.
     */
    update<E>(
      path: string,
      change: FrontmatterChange<E>,
      body?: BodyEdit,
    ): Effect.Effect<
      Note,
      E | NoteNotFoundError | NoteUnreadableError | NoteWriteRefusedError | NoteWriteError
    >;
    /** Moves the note to the trash the user chose in Obsidian. */
    trash(path: string): Effect.Effect<void, NoteNotFoundError | NoteTrashError>;
    /**
     * Renames the note in its folder; Obsidian updates the links to it. Returns the note at its
     * new path with its frontmatter as the store reads it after the move. Obsidian moves the file
     * only once its metadata cache has indexed earlier writes, so that includes a write just
     * before; but a rename that joined another rename in progress returns before its own move
     * (measured in 1.15.1), with the cache's frontmatter of that moment. A caller that has just
     * written keeps the frontmatter its write returned, as the record kit does.
     */
    rename(
      path: string,
      newName: string,
    ): Effect.Effect<
      Note,
      NoteNotFoundError | InvalidNoteNameError | NotePathTakenError | NoteWriteError
    >;
  }
>()("weg-manager/application/NoteStore") {}

/**
 * Opens a note for the user in Obsidian, in a new tab beside the plugin's view, so a note the
 * plugin cannot write (read-only, unreadable, of no known type) can be repaired by hand. A path
 * that holds no Markdown note is `NoteNotFoundError`, also when the note leaves the vault while
 * it opens; any other failure of Obsidian to open it is `NoteOpenError`.
 */
export class NoteOpener extends Context.Service<
  NoteOpener,
  { open(path: string): Effect.Effect<void, NoteNotFoundError | NoteOpenError> }
>()("weg-manager/application/NoteOpener") {}

/**
 * Makes the UUID of a new record's `id` (`<type>-<uuid>`, ADR 0007): a fresh lower-case UUID per
 * call. The plugin's adapter draws it at random; tests and the harness count up, so ids are known.
 */
export class IdGenerator extends Context.Service<
  IdGenerator,
  { readonly uuid: Effect.Effect<string> }
>()("weg-manager/application/IdGenerator") {}

/**
 * The vault's files that are no notes: the originals a source refers to (ADR 0007, amendment
 * 26.11.2026). It only adds files and never changes or overwrites one; every path goes through
 * `normalizePath`. Notes stay with `NoteStore`.
 */
export class VaultFiles extends Context.Service<
  VaultFiles,
  {
    /** Whether a file lies at `path`. */
    exists(path: string): Effect.Effect<boolean>;
    /**
     * The path a new file `name` (with its extension) would get in `folder`: the folder found as
     * `NoteStore.create` finds it, the name, else ` (2)`, ` (3)`, … before the extension.
     */
    freePath(
      folder: string,
      name: string,
    ): Effect.Effect<string, InvalidNoteNameError | NotePathTakenError>;
    /** Writes `bytes` as a new file at the free path (`freePath`), the folder created as needed. */
    write(
      folder: string,
      name: string,
      bytes: Uint8Array,
    ): Effect.Effect<string, InvalidNoteNameError | NotePathTakenError | NoteWriteError>;
    /** An address the view can show the file with (an image), or none when it is not there. */
    resourceUrl(path: string): Effect.Effect<string | undefined>;
    /** Opens the file in a new Obsidian tab, as `NoteOpener` opens a note. */
    open(path: string): Effect.Effect<void, NoteNotFoundError | NoteOpenError>;
  }
>()("weg-manager/application/VaultFiles") {}

/** A file the user picked outside the vault: its name, its content and the host's own handle. */
export type PickedFile = {
  readonly name: string;
  readonly bytes: Uint8Array;
  /** What the host needs to remove the original after a move; opaque to the application. */
  readonly handle: unknown;
};

/**
 * The user's files outside the vault, as far as a move needs them (PBI-11): whether the original
 * of a picked file can be removed (the desktop app, a file with a path), and removing it once its
 * copy is in the vault. Nothing else outside the vault is touched.
 */
export class LocalFiles extends Context.Service<
  LocalFiles,
  {
    movable(file: PickedFile): Effect.Effect<boolean>;
    remove(file: PickedFile): Effect.Effect<void, LocalFileRemoveError>;
  }
>()("weg-manager/application/LocalFiles") {}
