import { Schema } from "effect";

/** The matters screen (ADR 0008): the design's `vorgaenge`, a navigation entry of its own. */
export const MATTERS = { name: "matters" } as const;

/** The route schema of the matters screen. */
export const MattersRoute = Schema.Struct({ name: Schema.Literal(MATTERS.name) });
