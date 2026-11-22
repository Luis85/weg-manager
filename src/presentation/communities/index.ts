// The public face of the communities module's presentation (ADR 0006). It loads Vue, so
// `src/presentation/app-surface.ts` imports it only lazily.
import type { Component } from "vue";
import CommunitySettings from "./components/CommunitySettings.vue";
import CommunitySwitch from "./components/CommunitySwitch.vue";

/** The module's section of the settings screen: the communities, their form and dialogs. */
export const communitiesSettings: Component = CommunitySettings;

/** What the module puts into the app frame: the community switch in its context area. */
export const communitiesFrame: { readonly context: Component } = { context: CommunitySwitch };
