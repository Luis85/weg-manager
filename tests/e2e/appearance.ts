import { browser } from "@wdio/globals";
import { contrast, flatten, floor2, type Rgba } from "../support/contrast";
import { ROOT, setColorScheme } from "./support";

/**
 * Helpers for the appearance spec: colours and boxes read from the rendered page in Obsidian.
 * Code passed to `execute` is serialised, so each collector carries its own colour parser: it
 * reads a computed colour through `color-mix(in srgb, …)`, which Chromium serialises with exact
 * channels and alpha whatever space the colour was written in.
 */

/** One visible text: its colour and the backgrounds behind it, from its own outwards. */
type TextSample = {
  readonly text: string;
  readonly testid: string;
  readonly fg: Rgba;
  readonly layers: readonly Rgba[];
};

export type Measured = { readonly text: string; readonly testid: string; readonly ratio: number };

/** Every visible, enabled text inside `scope`, with its colours. */
const textSamples = (scope: string): Promise<TextSample[]> =>
  browser.execute((selector) => {
    const probe = document.createElement("i");
    document.body.append(probe);
    const parse = (css: string): [number, number, number, number] => {
      probe.style.color = `color-mix(in srgb, ${css} 100%, transparent)`;
      const text = getComputedStyle(probe).color;
      const numbers = (text.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
      const scale = text.startsWith("color(") ? 255 : 1;
      const [r = 0, g = 0, b = 0, a = 1] = numbers;
      const clamp = (value: number) => Math.min(255, Math.max(0, value * scale));
      return [clamp(r), clamp(g), clamp(b), a];
    };
    const layersOf = (element: Element) => {
      const layers: [number, number, number, number][] = [];
      for (let node: Element | null = element; node !== null; node = node.parentElement) {
        const layer = parse(getComputedStyle(node).backgroundColor);
        if (layer[3] > 0) layers.push(layer);
        if (layer[3] >= 1) return layers;
      }
      layers.push([255, 255, 255, 1]);
      return layers;
    };
    const root = document.querySelector(selector);
    const samples = [...(root?.querySelectorAll("*") ?? [])]
      .filter((element) =>
        [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
        ),
      )
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return (
          box.width > 1 &&
          box.height > 1 &&
          element.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
          element.closest(":disabled, [aria-disabled=true]") === null
        );
      })
      .map((element) => ({
        text: (element.textContent ?? "").trim().slice(0, 50),
        testid: element.closest("[data-testid]")?.getAttribute("data-testid") ?? "",
        fg: parse(getComputedStyle(element).color),
        layers: layersOf(element),
      }));
    probe.remove();
    return samples;
  }, scope);

/**
 * Contrast of every visible text inside `scope` (the plugin root, portal included, by default)
 * against the background it sits on.
 */
export const measureTexts = async (scope = ROOT): Promise<Measured[]> =>
  (await textSamples(scope)).map(({ text, testid, fg, layers }) => ({
    text,
    testid,
    ratio: floor2(contrast(fg, flatten(layers))),
  }));

/**
 * The boundary of each text input in the root: the colour of its outline (a ring is an inset box
 * shadow, a border a border), against the background around it.
 */
export const measureFieldBoundaries = async (): Promise<Measured[]> => {
  const fields = await browser.execute((selector) => {
    const probe = document.createElement("i");
    document.body.append(probe);
    const parse = (css: string): [number, number, number, number] => {
      probe.style.color = `color-mix(in srgb, ${css} 100%, transparent)`;
      const text = getComputedStyle(probe).color;
      const numbers = (text.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
      const scale = text.startsWith("color(") ? 255 : 1;
      const [r = 0, g = 0, b = 0, a = 1] = numbers;
      const clamp = (value: number) => Math.min(255, Math.max(0, value * scale));
      return [clamp(r), clamp(g), clamp(b), a];
    };
    const layersOf = (element: Element | null) => {
      const layers: [number, number, number, number][] = [];
      for (let node = element; node !== null; node = node.parentElement) {
        const layer = parse(getComputedStyle(node).backgroundColor);
        if (layer[3] > 0) layers.push(layer);
        if (layer[3] >= 1) return layers;
      }
      layers.push([255, 255, 255, 1]);
      return layers;
    };
    /** The colours of the visible rings of a computed box-shadow (`<colour> 0 0 0 <spread>`). */
    const rings = (shadow: string) =>
      shadow === "none"
        ? []
        : shadow
            .split(/,(?![^(]*\))/)
            .map((part) => part.trim())
            .filter((part) => /\b0px 0px 0px [1-9]/.test(part))
            .map((part) => parse(part.slice(0, part.search(/\s-?\d*\.?\d+px/))))
            .filter((colour) => colour[3] > 0);
    const root = document.querySelector(selector);
    const results = [...(root?.querySelectorAll("input:not([type=radio])") ?? [])].map((input) => {
      const style = getComputedStyle(input);
      const border = parseFloat(style.borderTopWidth) > 0 ? [parse(style.borderTopColor)] : [];
      return {
        testid: input.closest("[data-testid]")?.getAttribute("data-testid") ?? "",
        outlines: [...rings(style.boxShadow), ...border],
        around: layersOf(input.parentElement),
      };
    });
    probe.remove();
    return results;
  }, ROOT);
  return fields.map(({ testid, outlines, around }) => {
    const background = flatten(around);
    const ratios = outlines.map((outline) => contrast(outline, background));
    return { text: "input", testid, ratio: floor2(Math.max(1, ...ratios)) };
  });
};

/** Switches Obsidian's base theme and waits until the plugin root follows and colours settle. */
export const useScheme = async (scheme: "light" | "dark") => {
  await setColorScheme(scheme);
  await browser.waitUntil(
    () =>
      browser.execute(
        (selector, wanted) => document.querySelector(selector)?.classList.contains(wanted) ?? false,
        ROOT,
        scheme,
      ),
    { timeoutMsg: `the root never turned ${scheme}` },
  );
  await transitionsSettled();
};

/**
 * Waits until no CSS transition inside the plugin's root is running. Nuxt UI's buttons fade their
 * colours (`transition-colors`, 150 ms) when the theme changes, and a computed colour read in the
 * middle is neither the old nor the new one. A style change starts its transitions at the next
 * style recalculation, so this lets two frames pass first, then waits for each running transition
 * to finish.
 */
export const transitionsSettled = () =>
  browser.execute(async (selector) => {
    await new Promise<void>((done) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          done();
        });
      });
    });
    const root = document.querySelector(selector);
    const running = document
      .getAnimations()
      .filter(
        (animation) =>
          animation instanceof CSSTransition &&
          animation.effect instanceof KeyframeEffect &&
          animation.effect.target !== null &&
          root?.contains(animation.effect.target) === true,
      );
    await Promise.allSettled(running.map((animation) => animation.finished));
  }, ROOT);

/** Moves the pointer off the plugin, so no hover colour is measured. */
export const parkPointer = () =>
  browser.action("pointer").move({ x: 1, y: 1, origin: "viewport" }).perform();

/** Computed styles of every element matching `css` inside the root. */
export const stylesOf = (css: string, properties: readonly string[]) =>
  browser.execute(
    (selector, inner, names) =>
      [...(document.querySelector(selector)?.querySelectorAll(inner) ?? [])].map((element) => {
        const style = getComputedStyle(element);
        return Object.fromEntries([
          ["element", element.tagName.toLowerCase()],
          ...names.map((name) => [name, style.getPropertyValue(name)]),
        ]) as Record<string, string>;
      }),
    ROOT,
    css,
    [...properties],
  );

/** Elements of the root whose box reaches past the root's right edge, and the root's scroll. */
export const overflow = () =>
  browser.execute((selector) => {
    const root = document.querySelector<HTMLElement>(selector);
    if (root === null) return { scroll: -1, past: ["no root"] };
    const edge = root.getBoundingClientRect().right;
    const past = [...root.querySelectorAll("*")]
      .filter((element) => element.getBoundingClientRect().right > edge + 0.5)
      .map((element) => element.closest("[data-testid]")?.getAttribute("data-testid") ?? "?");
    return { scroll: root.scrollWidth - root.clientWidth, past: [...new Set(past)] };
  }, ROOT);

/** One badge of the palette: its fill and the contrast of its text against that fill. */
export type PaletteBadge = {
  readonly color: string;
  readonly fill: Rgba;
  readonly ratio: number;
};

/**
 * A badge for each colour in `colors`, drawn the way the plugin draws one (`data-community-color`
 * inside the root), read back and removed again: its fill and the contrast of its short code.
 */
export const measurePalette = async (colors: readonly string[]): Promise<PaletteBadge[]> => {
  const badges = await browser.execute(
    (selector, names) => {
      const probe = document.createElement("i");
      document.body.append(probe);
      const parse = (css: string): [number, number, number, number] => {
        probe.style.color = `color-mix(in srgb, ${css} 100%, transparent)`;
        const text = getComputedStyle(probe).color;
        const numbers = (text.match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
        const scale = text.startsWith("color(") ? 255 : 1;
        const [r = 0, g = 0, b = 0, a = 1] = numbers;
        const clamp = (value: number) => Math.min(255, Math.max(0, value * scale));
        return [clamp(r), clamp(g), clamp(b), a];
      };
      const host = document.createElement("div");
      document.querySelector(selector)?.append(host);
      const results = names.map((color) => {
        const badge = document.createElement("span");
        badge.dataset["communityColor"] = color;
        badge.textContent = "AB";
        host.append(badge);
        const style = getComputedStyle(badge);
        return { color, fill: parse(style.backgroundColor), text: parse(style.color) };
      });
      host.remove();
      probe.remove();
      return results;
    },
    ROOT,
    [...colors],
  );
  return badges.map(({ color, fill, text }) => ({
    color,
    fill,
    ratio: floor2(contrast(text, fill)),
  }));
};
