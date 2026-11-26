import { Schema } from "effect";

/** The week screen (ADR 0008): the design's `woche` (VIEW-02), a navigation entry of its own. */
export const WEEK = { name: "week" } as const;

/** The route schema of the week screen. */
export const WeekRoute = Schema.Struct({ name: Schema.Literal(WEEK.name) });
