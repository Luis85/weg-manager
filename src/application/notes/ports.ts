// Stryker disable StringLiteral: the only string here is a service key; it only has to be unique and tests cannot observe its text.
import { Context, type Effect, type Result } from "effect";
import type { VaultReadError } from "../shell";
import type {
  InvalidNoteNameError,
  NoteNotFoundError,
  NotePathTakenError,
  NoteUnreadableError,
  NoteWriteError,
} from "./errors";

/** A note's frontmatter as plain data: what Obsidian's YAML parser makes of it. */
export type Frontmatter = Readonly<Record<string, unknown>>;

/**
 * A note as the store hands it out: its vault path and a copy of its frontmatter. The frontmatter is
 * also how a caller detects a change: a later read that differs per field is a change (ADR 0007),
 * whatever else happened to the file.
 */
export type Note = { readonly path: string; readonly frontmatter: Frontmatter };

export type NewNote = {
  /** Vault folder, created with its parents when missing; `""` or `"/"` is the vault root. */
  readonly folder: string;
  /** File name without `.md`. A taken name gets ` (2)`, ` (3)`, … */
  readonly name: string;
  readonly frontmatter: Frontmatter;
  readonly body?: string;
};

/**
 * What an update writes. Keys in `set` are written in their place or appended; keys in `remove` are
 * deleted unless `set` has them too. Every other key, known or not, stays as it is, in its order.
 */
export type FrontmatterPatch = {
  readonly set?: Frontmatter;
  readonly remove?: readonly string[];
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
     * The paths of the Markdown notes in `folder` or below (`/` is the whole vault) whose
     * frontmatter block cannot be read: broken YAML, or YAML that is no map. `list` leaves them
     * out and `read` gives `{}`, so this is the only way to find them. Sorted by path.
     */
    unreadable(folder: string): Effect.Effect<readonly string[], VaultReadError>;
    create(
      note: NewNote,
    ): Effect.Effect<Note, InvalidNoteNameError | NotePathTakenError | NoteWriteError>;
    /** Runs `change` on the current frontmatter inside one atomic write; the body is untouched. */
    update<E>(
      path: string,
      change: FrontmatterChange<E>,
    ): Effect.Effect<Note, E | NoteNotFoundError | NoteUnreadableError | NoteWriteError>;
    /** Moves the note to the trash the user chose in Obsidian. */
    trash(path: string): Effect.Effect<void, NoteNotFoundError | NoteWriteError>;
    /** Renames the note in its folder; Obsidian updates the links to it. */
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
 * Makes the UUID of a new record's `id` (`<type>-<uuid>`, ADR 0007): a fresh lower-case UUID per
 * call. The plugin's adapter draws it at random; tests and the harness count up, so ids are known.
 */
export class IdGenerator extends Context.Service<
  IdGenerator,
  { readonly uuid: Effect.Effect<string> }
>()("weg-manager/application/IdGenerator") {}
