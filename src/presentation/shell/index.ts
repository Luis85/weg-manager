// The public face of the shell's presentation (ADR 0006). It stays free of Vue: bootstrap imports
// it at plugin load, and the Vue surface comes only through `loadSurface`.
export { releaseAll } from "./release";
export { loadSurface, type SurfaceLoader } from "./surface";
