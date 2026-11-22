// The second entry of the notes module's application layer (ADR 0006, amendment 22.11.2026): the
// kit the `NoteStore` adapters build on. Only `src/infrastructure/**` (and tests) import it;
// features reach the vault through `NoteStore` alone. ESLint and fallow enforce both.
export { asDefect, createNote, trashCommand, writeCommand } from "./command";
export { copyFrontmatter, recordNotes } from "./frontmatter";
export { newNoteText, updateNoteText } from "./note-text";
export { pathsInFolder, planRename } from "./paths";
