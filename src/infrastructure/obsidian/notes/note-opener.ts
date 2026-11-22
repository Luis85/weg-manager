import { Effect, Layer } from "effect";
import { normalizePath, type App } from "obsidian";
import { NoteNotFoundError, NoteOpenError, NoteOpener } from "../../../application/notes";
import { isFileGone } from "../../../application/notes/adapter";

/**
 * The `NoteOpener` on Obsidian: the note opens in a new tab (`getLeaf("tab")`), made the active
 * one, so the plugin's fixed tab stays open beside it (ADR 0008). Only a Markdown note opens.
 * When `openFile` rejects, that is Obsidian's failure, not the plugin's: `NoteNotFoundError` when
 * the note left the vault meanwhile or the rejection says the file is gone (ENOENT), else
 * `NoteOpenError`, which the user can retry.
 */
export const noteOpenerLayer = (app: App): Layer.Layer<NoteOpener> =>
  Layer.succeed(NoteOpener)({
    open: (path) =>
      Effect.suspend(() => {
        const file = app.vault.getFileByPath(normalizePath(path));
        if (file === null || file.extension !== "md") return Effect.fail(new NoteNotFoundError());
        return Effect.tryPromise({
          try: () => app.workspace.getLeaf("tab").openFile(file, { active: true }),
          catch: (cause) =>
            isFileGone(cause) || app.vault.getFileByPath(file.path) !== file
              ? new NoteNotFoundError()
              : new NoteOpenError({ cause }),
        });
      }),
  });
