// The Vue-free entry of the shell's presentation (ADR 0006): what bootstrap and the Obsidian
// adapters need at plugin load. Nothing here may import Vue at runtime; the surface comes only
// through `loadSurface`. Feature components import `index.ts` instead.
export { releaseAll } from "./release";
export { loadSurface, type SurfaceLoader } from "./surface";
