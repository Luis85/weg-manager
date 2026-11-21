// The public face of the communities module's presentation (ADR 0006). It loads Vue, so
// `src/presentation/app-surface.ts` imports it only lazily.
import type { Component } from "vue";
import type { CommunitiesRoute } from "../../application/communities";
import CommunitySettings from "./components/CommunitySettings.vue";

export { default as CommunitySwitch } from "./components/CommunitySwitch.vue";

/** The screen of each communities route; typecheck fails while a route has none. */
export const communitiesScreens: { readonly [Name in CommunitiesRoute["name"]]: Component } = {
  settings: CommunitySettings,
};
