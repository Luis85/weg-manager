import type { mountSurface } from "./mount";

/** Loads the Vue surface module; `ShellView` takes another one in tests. */
export type SurfaceLoader = () => Promise<{ readonly mountSurface: typeof mountSurface }>;

/**
 * Vue, Nuxt UI and TanStack Form are evaluated on the first `import()`, when a view opens, not
 * while the plugin loads. The bundle stays one file: rolldown turns the import into a lazy init.
 */
export const loadSurface: SurfaceLoader = () => import("./mount");
