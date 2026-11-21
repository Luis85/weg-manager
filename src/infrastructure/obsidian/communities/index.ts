// The public face of the communities module's adapters (ADR 0006): composition imports only this.
import type { Layer } from "effect";
import {
  communitySelectionLayer,
  type CommunitiesServices,
} from "../../../application/communities";
import type { NotesServices } from "../../../application/notes";
import type { ShellServices } from "../../../application/shell";

/**
 * The communities module's services for one plugin load. The module needs no adapter of its own:
 * its notes go through the notes module's `NoteStore`, its selection through the shell's
 * `DeviceStore`. So its Layer is the selection over those.
 */
export const communitiesLayer: Layer.Layer<
  CommunitiesServices,
  never,
  ShellServices | NotesServices
> = communitySelectionLayer;
