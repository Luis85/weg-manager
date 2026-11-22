import type { ModuleScreens } from "../shell";

/**
 * The communities module's screens (ADR 0006): its settings section with the list and the
 * community switch in the frame's context area. Vue-free: the
 * components load with the module's `index.ts` when they are first shown.
 */
export const communitiesScreens = {
  screens: {},
  sections: {
    communities: {
      label: (catalog) => catalog.communities.route,
      component: () => import("./index").then(({ communitiesSettings }) => communitiesSettings),
    },
  },
  context: () => import("./index").then(({ communitiesFrame }) => communitiesFrame.context),
} satisfies ModuleScreens<"communities">;
