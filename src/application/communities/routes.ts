import { Schema } from "effect";

/**
 * The routes of the communities module (ADR 0008): the community settings, the screen
 * `einstellungen/gemeinschaften` of the design. It is the start route until the overview exists.
 */
export const CommunitiesRoute = Schema.Struct({
  name: Schema.Literal("settings"),
  section: Schema.Literal("communities"),
});
export type CommunitiesRoute = typeof CommunitiesRoute.Type;

/** The community settings. */
export const COMMUNITY_SETTINGS: CommunitiesRoute = { name: "settings", section: "communities" };
