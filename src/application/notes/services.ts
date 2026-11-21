import type { NoteStore } from "./ports";

/** The services the notes module provides to every use case; part of `AppServices`. */
export type NotesServices = NoteStore;
