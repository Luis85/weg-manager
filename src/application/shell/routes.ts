import { Option, Schema } from "effect";

/**
 * A route is data, not a URL (ADR 0008): a `name` and at most the parameters its screen needs. A
 * view keeps its route in Obsidian's view state, so it must survive JSON.
 */
export type RouteLike = { readonly name: string };

/** What a view needs to keep a route: the start route, a decoder that never fails, equality. */
export type Routes<R extends RouteLike> = {
  readonly start: R;
  /**
   * The route in `value`, without keys the route does not have. Anything else (an unknown name, a
   * missing or broken parameter, no object at all) gives `start`.
   */
  decode(value: unknown): R;
  /** Whether two routes are the same, compared by value. */
  equals(a: R, b: R): boolean;
};

/** The `Routes` of a route schema, the union of the modules' routes in the app. */
export const routesOf = <R extends RouteLike>(
  schema: Schema.Codec<R>,
  start: NoInfer<R>,
): Routes<R> => {
  const decode = Schema.decodeUnknownOption(schema);
  const equivalence = Schema.toEquivalence(schema);
  return {
    start,
    decode: (value) => Option.getOrElse(decode(value), () => start),
    equals: (a, b) => equivalence(a, b),
  };
};

/**
 * The name of the settings screen's route (`einstellungen/<bereich>` in the design). The screen
 * belongs to the shell; its sections come from the modules (ADR 0008, amendment 22.11.2026).
 */
export const SETTINGS = "settings";

/** The settings screen on one of its sections. */
export type SettingsRoute<S extends string = string> = {
  readonly name: typeof SETTINGS;
  readonly section: S;
};

/**
 * The route schema of the settings screen: `section` is one of `sections`, the ids the modules
 * contribute, which the application root composes (`SETTINGS_SECTIONS`, `src/application/routes.ts`).
 * An unknown section decodes as no route at all, so a view falls back to the start route.
 */
export const settingsRoute = <const S extends readonly string[]>(sections: S) =>
  Schema.Struct({ name: Schema.Literal(SETTINGS), section: Schema.Literals(sections) });
