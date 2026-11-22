import type { SettingsRoute } from "../shell";

/**
 * The communities module's section of the settings screen (ADR 0008): the design's
 * `einstellungen/gemeinschaften`, with the community list, the form and the delete dialog.
 */
export const COMMUNITIES_SECTION = "communities";

/** The community settings. It is the start route until the overview exists. */
export const COMMUNITY_SETTINGS: SettingsRoute<typeof COMMUNITIES_SECTION> = {
  name: "settings",
  section: COMMUNITIES_SECTION,
};
