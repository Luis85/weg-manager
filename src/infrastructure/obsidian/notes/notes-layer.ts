import { Layer } from "effect";
import type { Plugin } from "obsidian";
import {
  noteIndexLayer,
  type NoteTypeRegistry,
  type NotesServices,
} from "../../../application/notes";
import type { ShellServices } from "../../../application/shell";
import { randomIdGeneratorLayer } from "./id-generator";
import { noteStoreLayer } from "./note-store";

/**
 * The notes module's services for one plugin load: the Obsidian `NoteStore`, the id generator,
 * and the note index over the store for the note types of `types`. The index needs the shell's
 * services and subscribes to the event bus while it is built, so the shell builds it before the
 * host event adapter (`shellLayer`).
 */
export const notesLayer = (
  plugin: Plugin,
  types: NoteTypeRegistry,
): Layer.Layer<NotesServices, never, ShellServices> =>
  noteIndexLayer(types).pipe(
    Layer.provideMerge(Layer.merge(noteStoreLayer(plugin.app), randomIdGeneratorLayer)),
  );
