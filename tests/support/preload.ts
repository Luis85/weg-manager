/**
 * Loads what a view imports the first time it opens: the surface (Vue, Nuxt UI) and the screens
 * and context that `appSurface` loads lazily. Transforming and evaluating them is CPU work of a
 * few hundred milliseconds, several seconds on a loaded machine. A test file that opens a view
 * awaits this once at its top, so the first test does not pay for it inside its own timeout.
 * (`lazy-presentation.test.ts` must not: it proves nothing of this loads before a view opens.)
 */
export const preloadSurface = (): Promise<unknown> =>
  Promise.all([
    import("../../src/presentation/shell/mount"),
    import("../../src/presentation/communities"),
    import("../../src/presentation/notes"),
    import("../../src/presentation/shell"),
  ]);
