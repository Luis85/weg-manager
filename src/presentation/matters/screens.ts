import { MATTERS } from "../../application/matters";
import type { ModuleScreens } from "../shell";

/**
 * The matters module's screens (ADR 0006): its own screen `matters` with an entry in the frame's
 * navigation. Vue-free: the components load with the module's `index.ts` when first shown.
 */
export const mattersScreens = {
  screens: {
    matters: () => import("./index").then(({ mattersScreen }) => mattersScreen),
  },
  sections: {},
  menu: [
    {
      route: MATTERS,
      label: (catalog) => catalog.matters.route,
      icon: "i-lucide-list-checks",
      order: 30,
    },
  ],
} satisfies ModuleScreens<"matters">;
