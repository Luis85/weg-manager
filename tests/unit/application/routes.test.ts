import { describe, expect, it } from "vitest";
import { appRoutes } from "../../../src/application/routes";

/** The composed routes every view decodes its state with (ADR 0008). */
describe("appRoutes", () => {
  it("starts on the community settings", () => {
    expect(appRoutes.start).toStrictEqual({ name: "settings", section: "communities" });
  });

  it("decodes the community settings without keys the route does not have", () => {
    expect(appRoutes.decode({ name: "settings", section: "communities", extra: 1 })).toStrictEqual({
      name: "settings",
      section: "communities",
    });
  });

  it("falls back to the start route for anything else, the old demo route included", () => {
    expect(appRoutes.decode({ name: "welcome" })).toBe(appRoutes.start);
    expect(appRoutes.decode({ name: "settings", section: "contacts" })).toBe(appRoutes.start);
    expect(appRoutes.decode("settings")).toBe(appRoutes.start);
  });
});
