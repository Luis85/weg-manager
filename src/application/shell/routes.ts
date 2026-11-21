import { Option, Schema } from "effect";

/**
 * A route is data, not a URL (ADR 0008): a `name` and at most the parameters its screen needs. A
 * view keeps its route in Obsidian's view state, so it must survive JSON.
 */
export type RouteLike = { readonly name: string };

/**
 * The shell's routes. The demo panel (greeting and file count) is the only screen and the start
 * route until the first feature slice adds its own.
 */
export const ShellRoute = Schema.Struct({ name: Schema.Literal("welcome") });

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
