// The in-memory notes adapter for tests and the browser harness (ADR 0007). Nothing in the plugin
// may import it: lint, fallow and `npm run check:dist` keep it out of `main.js`.
export { TEST_ONLY_MARKER, memoryNoteStore } from "./memory-note-store";
export { normalizePath } from "./normalize-path";
