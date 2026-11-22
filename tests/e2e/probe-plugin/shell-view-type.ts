/**
 * Stands in for `src/infrastructure/obsidian/shell/shell-view.ts` when the probe bundles the real
 * `open-route.ts` (`configs/vite.probe.config.ts`): the view's module imports the presentation,
 * which the probe must not bundle, and `openRoute` needs only the view type.
 * `tests/dom/infrastructure/shell/probe-view-type.test.ts` keeps the two the same.
 */
export const SHELL_VIEW_TYPE = "weg-manager-view";
