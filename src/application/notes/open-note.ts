import { NoteOpener } from "./ports";

/** Opens the note at `path` in a new Obsidian tab, for the user to read or repair it by hand. */
export const openNote = (path: string) => NoteOpener.use((opener) => opener.open(path));
