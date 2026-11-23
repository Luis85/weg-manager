/**
 * Obsidian's `normalizePath` (1.15.1), for the in-memory adapter, which may not import `obsidian`:
 * slashes and backslashes collapse to one `/`, leading and trailing ones go, an empty result is
 * `/`, non-breaking spaces (U+00A0, U+202F, written as escapes) become spaces, NFC. The e2e spec compares the real one with the same
 * cases (`tests/support/notes/fidelity.ts`).
 */
export const normalizePath = (path: string): string => {
  const collapsed = path.replace(/[\\/]+/g, "/").replace(/^\/+|\/+$/g, "");
  return (collapsed === "" ? "/" : collapsed).replace(/[\u00A0\u202F]/g, " ").normalize("NFC");
};
