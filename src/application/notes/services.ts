import type { NoteIndex } from "./note-index";
import type { IdGenerator, NoteStore } from "./ports";

/** The services the notes module provides to every use case; part of `AppServices`. */
export type NotesServices = NoteStore | IdGenerator | NoteIndex;
