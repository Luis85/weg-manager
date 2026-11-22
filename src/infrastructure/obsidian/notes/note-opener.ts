import { Effect, Layer } from "effect";
import { normalizePath, type App } from "obsidian";
import { NoteNotFoundError, NoteOpener } from "../../../application/notes";

/**
 * The `NoteOpener` on Obsidian: the note opens in a new tab (`getLeaf("tab")`), made the active
 * one, so the plugin's fixed tab stays open beside it (ADR 0008). Only a Markdown note opens.
 */
export const noteOpenerLayer = (app: App): Layer.Layer<NoteOpener> =>
  Layer.succeed(NoteOpener)({
    open: (path) =>
      Effect.suspend(() => {
        const file = app.vault.getFileByPath(normalizePath(path));
        if (file === null || file.extension !== "md") return Effect.fail(new NoteNotFoundError());
        return Effect.promise(() => app.workspace.getLeaf("tab").openFile(file, { active: true }));
      }),
  });
