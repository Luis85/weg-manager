import type { NoteIndex } from "./note-index";
import type { IdGenerator, LocalFiles, NoteOpener, NoteStore, VaultFiles } from "./ports";

/** The services the notes module provides to every use case; part of `AppServices`. */
export type NotesServices =
  NoteStore | NoteOpener | IdGenerator | NoteIndex | VaultFiles | LocalFiles;
