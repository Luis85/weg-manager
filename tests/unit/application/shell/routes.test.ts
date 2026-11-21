import { anything, assert as fcAssert, property } from "fast-check";
import { Schema } from "effect";
import { describe, expect, it } from "vitest";
import { ShellRoute, routesOf } from "../../../../src/application/shell/routes";

/** Two routes, one with a parameter, as a feature module would contribute them. */
const TestRoute = Schema.Union([
  Schema.Struct({ name: Schema.Literal("list") }),
  Schema.Struct({ name: Schema.Literal("record"), id: Schema.String }),
]);
type TestRoute = typeof TestRoute.Type;

const START: TestRoute = { name: "list" };
const routes = routesOf(TestRoute, START);

describe("routesOf", () => {
  it("keeps the start route", () => {
    expect(routes.start).toBe(START);
  });

  it("decodes a known route with its parameters", () => {
    expect(routes.decode({ name: "record", id: "ahornweg" })).toStrictEqual({
      name: "record",
      id: "ahornweg",
    });
    expect(routes.decode({ name: "list" })).toStrictEqual({ name: "list" });
  });

  it("drops keys that are not part of the route", () => {
    expect(routes.decode({ name: "record", id: "a", scroll: 3 })).toStrictEqual({
      name: "record",
      id: "a",
    });
  });

  it.each([
    ["an unknown name", { name: "gone" }],
    ["a missing parameter", { name: "record" }],
    ["a broken parameter", { name: "record", id: 7 }],
    ["no name", {}],
    ["undefined", undefined],
    ["null", null],
    ["a string", "record"],
    ["an array", [{ name: "list" }]],
  ])("falls back to the start route for %s", (_, value) => {
    expect(routes.decode(value)).toBe(START);
  });

  it("never throws and always returns a route of the table", () => {
    fcAssert(
      property(anything(), (value) => {
        expect(Schema.is(TestRoute)(routes.decode(value))).toBe(true);
      }),
    );
  });

  it("compares routes by value", () => {
    expect(routes.equals({ name: "record", id: "a" }, { id: "a", name: "record" })).toBe(true);
    expect(routes.equals({ name: "list" }, { name: "list" })).toBe(true);
    expect(routes.equals({ name: "record", id: "a" }, { name: "record", id: "b" })).toBe(false);
    expect(routes.equals({ name: "list" }, { name: "record", id: "a" })).toBe(false);
  });
});

describe("ShellRoute", () => {
  it("is the welcome screen and nothing else", () => {
    expect(Schema.decodeUnknownSync(ShellRoute)({ name: "welcome" })).toStrictEqual({
      name: "welcome",
    });
    expect(Schema.is(ShellRoute)({ name: "settings" })).toBe(false);
  });
});
