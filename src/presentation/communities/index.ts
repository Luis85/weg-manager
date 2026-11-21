// The public face of the communities module's presentation (ADR 0006). It loads Vue, so
// `src/presentation/app-surface.ts` imports it only lazily.
import type { Component } from "vue";
import type { CommunitiesRoute } from "../../application/communities";
import CommunitySettings from "./components/CommunitySettings.vue";
import CommunitySwitch from "./components/CommunitySwitch.vue";

/** The screen of each communities route; typecheck fails while a route has none. */
export const communitiesScreens: { readonly [Name in CommunitiesRoute["name"]]: Component } = {
  settings: CommunitySettings,
};

/** What the module puts into the app frame: the community switch in its context area. */
export const communitiesFrame: { readonly context: Component } = { context: CommunitySwitch };
