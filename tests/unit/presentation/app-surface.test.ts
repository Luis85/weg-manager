import { describe, expect, it } from "vitest";
import { MODULE_SCREENS, appSurface, frameContextOf } from "../../../src/presentation/app-surface";
import type { ScreenLoader } from "../../../src/presentation/shell/host";

const loader: ScreenLoader = () => Promise.resolve({});

describe("the frame's context area", () => {
  it("is filled by the communities module alone", () => {
    const filling = Object.entries(MODULE_SCREENS).flatMap(([name, part]) =>
      "context" in part && part.context !== undefined ? [name] : [],
    );
    expect(filling).toEqual(["communities"]);
    expect(appSurface.context).toBe(MODULE_SCREENS.communities.context);
  });

  it("fails loudly, naming the modules, when a second module fills it too", () => {
    expect(() =>
      frameContextOf([
        { name: "communities", context: loader },
        { name: "contacts", context: loader },
      ]),
    ).toThrow(
      "the frame has one context area, but the modules communities and contacts each define `context` in their screens.ts",
    );
  });

  it("is the one module's context, or none", () => {
    expect(frameContextOf([{ name: "shell" }, { name: "communities", context: loader }])).toBe(
      loader,
    );
    expect(frameContextOf([{ name: "shell" }])).toBeUndefined();
  });
});
