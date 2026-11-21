import { describe, expect, it } from "vitest";
import { appRoutes } from "../../../src/application/routes";

/** The composed routes every view decodes its state with (ADR 0008). */
describe("appRoutes", () => {
  it("starts on the welcome screen", () => {
    expect(appRoutes.start).toStrictEqual({ name: "welcome" });
  });

  it("decodes the shell's route and the community settings", () => {
    expect(appRoutes.decode({ name: "welcome" })).toStrictEqual({ name: "welcome" });
    expect(appRoutes.decode({ name: "settings", section: "communities", extra: 1 })).toStrictEqual({
      name: "settings",
      section: "communities",
    });
  });

  it("falls back to the start route for anything else", () => {
    expect(appRoutes.decode({ name: "settings", section: "contacts" })).toBe(appRoutes.start);
    expect(appRoutes.decode("welcome")).toBe(appRoutes.start);
  });
});
