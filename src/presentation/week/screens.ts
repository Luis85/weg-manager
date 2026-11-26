import { WEEK } from "../../application/week";
import type { ModuleScreens } from "../shell";

/**
 * The week module's screens (ADR 0006): its own screen `week` with an entry in the frame's
 * navigation, before the matters (sitemap: Lage · Woche · Vorgänge). Vue-free: the components load
 * with the module's `index.ts` when they are first shown.
 */
export const weekScreens = {
  screens: {
    week: () => import("./index").then(({ weekScreen }) => weekScreen),
  },
  sections: {},
  menu: [
    {
      route: WEEK,
      label: (catalog) => catalog.week.route,
      icon: "i-lucide-calendar-days",
      order: 20,
    },
  ],
} satisfies ModuleScreens<"week">;
