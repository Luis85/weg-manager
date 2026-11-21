/**
 * Runs every release in reverse order, even when one throws, then rethrows the first error.
 * Free of Vue on purpose: bootstrap imports it at plugin load, before any view has opened.
 */
export const releaseAll = (releases: readonly (() => void)[]): void => {
  const errors: unknown[] = [];
  for (const release of releases.toReversed()) {
    try {
      release();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length > 0) throw errors[0];
};
