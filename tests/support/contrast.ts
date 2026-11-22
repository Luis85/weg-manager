/**
 * WCAG 2.2 contrast maths for colours read from a rendered page (the e2e appearance spec reads
 * them in Obsidian). A colour is `[r, g, b, a]`: channels 0–255, alpha 0–1.
 */
export type Rgba = readonly [number, number, number, number];

/** WCAG 1.4.3 minimum for text (normal size). */
export const TEXT_CONTRAST = 4.5;
/** WCAG 1.4.11 minimum for the boundary of a user interface component. */
export const BOUNDARY_CONTRAST = 3;

const channel = (value: number): number => {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Relative luminance of an opaque colour (WCAG definition; alpha is ignored). */
export const luminance = ([r, g, b]: Rgba): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** `top` painted over `bottom` (source-over in sRGB, as the browser composites). */
export const over = (top: Rgba, bottom: Rgba): Rgba => {
  const alpha = top[3] + bottom[3] * (1 - top[3]);
  if (alpha === 0) return [0, 0, 0, 0];
  const mix = (i: 0 | 1 | 2) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / alpha;
  return [mix(0), mix(1), mix(2), alpha];
};

/**
 * The colour seen through a stack of backgrounds, listed from the element outwards (its own first,
 * the page last). The page is taken as opaque.
 */
export const flatten = (layers: readonly Rgba[]): Rgba => {
  const bottomUp = layers.toReversed();
  const [page, ...rest] = bottomUp;
  if (page === undefined) throw new Error("flatten: no background");
  return rest.reduce((below, layer) => over(layer, below), [page[0], page[1], page[2], 1] as Rgba);
};

/** Contrast ratio of `foreground` (composited over `background`) against `background`, 1–21. */
export const contrast = (foreground: Rgba, background: Rgba): number => {
  const back: Rgba = [background[0], background[1], background[2], 1];
  const front = over(foreground, back);
  const [high, low] = [luminance(front), luminance(back)].toSorted((a, b) => b - a) as [
    number,
    number,
  ];
  return (high + 0.05) / (low + 0.05);
};

/** Ratio rounded down to two decimals, so a report never shows a pass that is not one. */
export const floor2 = (ratio: number): number => Math.floor(ratio * 100) / 100;
