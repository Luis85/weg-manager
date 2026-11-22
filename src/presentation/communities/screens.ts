import { COMMUNITY_SETTINGS } from "../../application/communities";
import type { ModuleScreens } from "../shell";

/**
 * The communities module's screens (ADR 0006): its settings section with the list, the frame's
 * entry "Einstellungen", which opens the settings on it as the start route, and the community
 * switch in the frame's context area. Vue-free: the
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
  menu: [
    {
      route: COMMUNITY_SETTINGS,
      label: (catalog) => catalog.shell.frame.settings,
      icon: "i-lucide-settings",
    },
  ],
  context: () => import("./index").then(({ communitiesFrame }) => communitiesFrame.context),
} satisfies ModuleScreens<"communities">;
