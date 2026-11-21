/**
 * Obsidian's `normalizePath` (1.15.1), for the in-memory adapter, which may not import `obsidian`:
 * slashes and backslashes collapse to one `/`, leading and trailing ones go, an empty result is
 * `/`, non-breaking spaces become spaces, NFC. The e2e spec compares the real one with the same
 * cases (`tests/support/notes/fidelity.ts`).
 */
export const normalizePath = (path: string): string => {
  const collapsed = path.replace(/[\\/]+/g, "/").replace(/^\/+|\/+$/g, "");
  return (collapsed === "" ? "/" : collapsed).replace(/[  ]/g, " ").normalize("NFC");
};
