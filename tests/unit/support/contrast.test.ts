import { describe, expect, it } from "vitest";
import { contrast, flatten, floor2, luminance, over, type Rgba } from "../../support/contrast";

const WHITE: Rgba = [255, 255, 255, 1];
const BLACK: Rgba = [0, 0, 0, 1];

describe("contrast maths (WCAG 2.2)", () => {
  it("gives white and black their relative luminance", () => {
    expect(luminance(WHITE)).toBe(1);
    expect(luminance(BLACK)).toBe(0);
    // Mid grey through the sRGB curve, not linearly.
    expect(luminance([128, 128, 128, 1])).toBeCloseTo(0.2159, 4);
  });

  it("gives 21:1 for black on white and 1:1 for a colour on itself, in either order", () => {
    expect(contrast(BLACK, WHITE)).toBe(21);
    expect(contrast(WHITE, BLACK)).toBe(21);
    expect(contrast([152, 115, 247, 1], [152, 115, 247, 1])).toBe(1);
  });

  it.each([
    // Colours of Obsidian 1.15.1's default light theme (warning, error, accent, muted text).
    [[236, 117, 0, 1], WHITE, 2.95],
    [[233, 49, 71, 1], WHITE, 4.2],
    [WHITE, [152, 115, 247, 1], 3.42],
    [[92, 92, 92, 1], WHITE, 6.68],
  ] as const)("measures %j on %j as %f", (fg, bg, ratio) => {
    expect(floor2(contrast(fg, bg))).toBe(ratio);
  });

  it("composites a translucent foreground over the background first", () => {
    expect(contrast([0, 0, 0, 0], WHITE)).toBe(1);
    expect(contrast([0, 0, 0, 0.5], WHITE)).toBeCloseTo(contrast([128, 128, 128, 1], WHITE), 1);
  });

  it("paints a translucent colour over another", () => {
    expect(over([0, 0, 0, 0.5], WHITE)).toEqual([127.5, 127.5, 127.5, 1]);
    expect(over([0, 0, 0, 0], [10, 20, 30, 0])).toEqual([0, 0, 0, 0]);
    expect(over(BLACK, WHITE)).toEqual(BLACK);
  });

  it("flattens a stack of backgrounds from the element out to the page", () => {
    // A 10 % accent tint on a white page.
    const tint = flatten([[152, 115, 247, 0.1], WHITE]);
    expect(tint.map(Math.round)).toEqual([245, 241, 254, 1]);
    // Transparent layers change nothing; the page counts as opaque.
    expect(
      flatten([
        [0, 0, 0, 0],
        [28, 28, 28, 0.5],
      ]),
    ).toEqual([28, 28, 28, 1]);
    expect(() => flatten([])).toThrow("no background");
  });

  it("rounds a ratio down, never up", () => {
    expect(floor2(4.4999)).toBe(4.49);
    expect(floor2(4.5)).toBe(4.5);
  });
});
