import type { Component } from "vue";
import type { ShellRoute } from "../../application/shell";
import ShellPanel from "./components/ShellPanel.vue";

/**
 * The screen of each shell route; typecheck fails while a route has none. A module's presentation
 * offers its screens this way through its `index.ts`, and `src/presentation/app-surface.ts` loads
 * them lazily by route name.
 */
export const shellScreens: { readonly [Name in (typeof ShellRoute.Type)["name"]]: Component } = {
  welcome: ShellPanel,
};
