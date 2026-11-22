import type { Plugin } from "obsidian";
import type { AppAdapters } from "../../../application/app-services-layer";
import { randomIdGeneratorLayer } from "./id-generator";
import { noteStoreLayer } from "./note-store";

/** The notes module's ports that the Obsidian adapters serve. */
export type NotesAdapters = Pick<AppAdapters, "noteStore" | "idGenerator">;

/**
 * The Obsidian adapters of the notes module's ports for one plugin load: the `NoteStore` over the
 * vault and random ids. The note index over them is an application service (`appServicesLayer`).
 */
export const notesAdapters = (plugin: Plugin): NotesAdapters => ({
  noteStore: noteStoreLayer(plugin.app),
  idGenerator: randomIdGeneratorLayer,
});
