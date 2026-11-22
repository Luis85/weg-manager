import type { ModuleScreens } from "../shell";

/**
 * The notes module's screens (ADR 0006): the settings section "Datenprobleme" with its badge.
 * Vue-free: each component loads when it is first shown.
 */
export const notesScreens = {
  screens: {},
  sections: {
    "data-issues": {
      label: (catalog) => catalog.notes.dataIssues.title,
      component: () => import("./components/DataIssues.vue").then((module) => module.default),
      badge: () => import("./components/DataIssuesBadge.vue").then((module) => module.default),
    },
  },
} satisfies ModuleScreens<"notes">;
