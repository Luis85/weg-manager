import type { Plugin } from "obsidian";
import type { AppAdapters } from "../../../application/app-services-layer";
import { randomIdGeneratorLayer } from "./id-generator";
import { noteOpenerLayer } from "./note-opener";
import { noteStoreLayer } from "./note-store";
import { localFilesLayer, vaultFilesLayer } from "./vault-files";

/** The notes module's ports that the Obsidian adapters serve. */
export type NotesAdapters = Pick<
  AppAdapters,
  "noteStore" | "idGenerator" | "noteOpener" | "vaultFiles" | "localFiles"
>;

/**
 * The Obsidian adapters of the notes module's ports for one plugin load: the `NoteStore` over the
 * vault, random ids, and the `NoteOpener` that opens a note in a new tab. The note index over them is an application service (`appServicesLayer`).
 */
export const notesAdapters = (plugin: Plugin): NotesAdapters => ({
  noteStore: noteStoreLayer(plugin.app),
  idGenerator: randomIdGeneratorLayer,
  noteOpener: noteOpenerLayer(plugin.app),
  vaultFiles: vaultFilesLayer(plugin.app),
  localFiles: localFilesLayer,
});
