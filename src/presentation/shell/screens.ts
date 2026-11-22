import type { ModuleScreens } from "./routing";

/**
 * The shell's screens (ADR 0008): the settings screen, whose sections the modules add. Vue-free:
 * the screen loads with the shell's `index.ts` when it is first shown.
 */
export const shellScreens = {
  screens: { settings: () => import("./index").then(({ SettingsScreen }) => SettingsScreen) },
  sections: {},
} satisfies ModuleScreens<"shell">;
