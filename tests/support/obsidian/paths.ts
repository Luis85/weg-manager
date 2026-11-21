/**
 * Obsidian's `normalizePath` (1.15.1): slashes and backslashes collapse to one `/`, leading and
 * trailing ones go, an empty result is `/`, non-breaking spaces become spaces, NFC. It neither
 * trims spaces nor resolves `.` or `..`. `tests/e2e/specs/note-store.e2e.ts` compares it with the
 * real one.
 */
export const normalizePath = (path: string): string => {
  const collapsed = path.replace(/[\\/]+/g, "/").replace(/^\/+|\/+$/g, "");
  return (collapsed === "" ? "/" : collapsed).replace(/[  ]/g, " ").normalize("NFC");
};
