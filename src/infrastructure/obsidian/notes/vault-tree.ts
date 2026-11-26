import { TFolder, type App, type TFile } from "obsidian";
import { NoteNotFoundError, NoteOpenError } from "../../../application/notes";
import { isFileGone } from "../../../application/notes/adapter";

/**
 * The entries of a vault folder as the path planning needs them (`SiblingsOf`, `FoldersIn`).
 * Obsidian's lookups are case-sensitive (d.ts), so clashes are found among the children.
 */
export const vaultTree = (vault: App["vault"]) => {
  const childrenOf = (folder: string) =>
    (folder === "/" ? vault.getRoot() : vault.getFolderByPath(folder))?.children ?? [];
  return {
    siblingsOf: (folder: string) => childrenOf(folder).map((child) => child.path),
    foldersIn: (folder: string) =>
      childrenOf(folder).flatMap((child) => (child instanceof TFolder ? [child.path] : [])),
  };
};

/**
 * Opens `file` in a new tab, made the active one, so the plugin's tab stays open beside it (ADR
 * 0008). A rejection is Obsidian's failure: `NoteNotFoundError` when the file left the vault
 * meanwhile or the rejection says it is gone (ENOENT), else `NoteOpenError`, which can be retried.
 */
export const openInTab = (app: App, file: TFile) => ({
  try: () => app.workspace.getLeaf("tab").openFile(file, { active: true }),
  catch: (cause: unknown) =>
    isFileGone(cause) || app.vault.getFileByPath(file.path) !== file
      ? new NoteNotFoundError()
      : new NoteOpenError({ cause }),
});
