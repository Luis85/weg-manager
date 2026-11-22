import type { NoteFields, NoteType } from "../../domain/notes";

/**
 * True when `path` lies in the normalized `folder` or in a folder below it; every path lies in the
 * vault root `/`. `WEG Manager Alt/A.md` does not lie in `WEG Manager`.
 */
export const isInFolder = (path: string, folder: string): boolean =>
  folder === "/" || path.startsWith(`${folder}/`);

/**
 * The vault folder where new notes of `type` go: its folder below the root folder (ADR 0007), or
 * the root folder itself for a type without one.
 */
export const recordFolder = <F extends NoteFields>(
  rootFolder: string,
  type: NoteType<F>,
): string => (type.folder === undefined ? rootFolder : `${rootFolder}/${type.folder}`);
