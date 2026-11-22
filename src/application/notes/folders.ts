/**
 * True when `path` lies in the normalized `folder` or in a folder below it; every path lies in the
 * vault root `/`. `WEG Manager Alt/A.md` does not lie in `WEG Manager`.
 */
export const isInFolder = (path: string, folder: string): boolean =>
  folder === "/" || path.startsWith(`${folder}/`);
