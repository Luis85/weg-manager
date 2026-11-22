// The in-memory shell adapters for tests and the browser harness. Nothing in the plugin may import
// them: lint and fallow keep them out of `main.js` (ADR 0007, in-memory adapters).
export { deviceStoreInMemory } from "./device-store";
export { memoryToday } from "./today";
