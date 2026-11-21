import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { SCOPE_CLASS, scopeCss } from "../../../scripts/scope-css.mjs";

const ID = "weg-manager";
const ROOT = `.${ID}-root`;

const run = (css: string, file = "src/styles/app.css", skip?: (file: string) => boolean) =>
  postcss([scopeCss({ id: ID, prefix: "wm", ...(skip ? { skip } : {}) })])
    .process(css, { from: file })
    .then((result) =>
      result.css
        .replace(/\s+/g, " ")
        .replace(/\s*([{};,])\s*/g, "$1")
        .trim(),
    );

describe("scopeCss", () => {
  it("exposes the root class", () => {
    expect(SCOPE_CLASS).toBe(`${ID}-root`);
  });

  it("scopes a plain selector under the root", async () => {
    expect(await run(".a{}")).toBe(`${ROOT} .a{}`);
  });

  it("scopes every selector of a list", async () => {
    expect(await run(".a,.b>.c{color:red}")).toBe(`${ROOT} .a,${ROOT} .b>.c{color:red}`);
  });

  it.each([":root", ":host"])("turns %s into the root itself", async (selector) => {
    expect(await run(`${selector}{--x:1}`)).toBe(`${ROOT}{--x:1}`);
  });

  it.each(["dark", "light"])("puts the .%s theme class on the root itself", async (theme) => {
    expect(await run(`.${theme}{--x:1}`)).toBe(`${ROOT}.${theme}{--x:1}`);
    expect(await run(`.${theme} .a{--x:1}`)).toBe(`${ROOT}.${theme} .a{--x:1}`);
  });

  it.each([
    ["html{color:red}", `${ROOT}{color:red}`],
    ["body .a{color:red}", `${ROOT} .a{color:red}`],
    ["html body{color:red}", `${ROOT}{color:red}`],
    ["*{margin:0}", `${ROOT} *{margin:0}`],
    ["*,::before,::after{--tw-a:0}", `${ROOT} *,${ROOT} ::before,${ROOT} ::after{--tw-a:0}`],
  ])("never emits %s bare", async (input, output) => {
    expect(await run(input)).toBe(output);
  });

  it("unwraps @layer blocks and drops layer order statements", async () => {
    expect(await run("@layer theme, base;@layer base{.a{}}")).toBe(`${ROOT} .a{}`);
  });

  it("unwraps nested @layer blocks", async () => {
    expect(await run("@layer a{@layer b{.x{}}}")).toBe(`${ROOT} .x{}`);
  });

  it("prefixes keyframes and their uses", async () => {
    const css = await run(
      "@keyframes spin{from{opacity:0}50%{opacity:.5}}.a{animation:spin 1s linear}.b{animation-name:spin}",
    );
    expect(css).toBe(
      `@keyframes wm-spin{from{opacity:0}50%{opacity:.5}}${ROOT} .a{animation:wm-spin 1s linear}${ROOT} .b{animation-name:wm-spin}`,
    );
  });

  it("leaves an already prefixed keyframe name alone", async () => {
    expect(await run("@keyframes wm-pulse{to{opacity:1}}.a{animation:wm-pulse 1s}")).toBe(
      `@keyframes wm-pulse{to{opacity:1}}${ROOT} .a{animation:wm-pulse 1s}`,
    );
  });

  it("does not rename an animation word that is not a keyframe of this file", async () => {
    expect(await run(".a{animation:none 1s}")).toBe(`${ROOT} .a{animation:none 1s}`);
  });

  it("prefixes @property names and renames every use", async () => {
    const css = await run(
      "@property --tw-x{syntax:'*';inherits:false}.a{--tw-x:1;width:var(--tw-x);--tw-xy:2}",
    );
    expect(css).toBe(
      `@property --wm-tw-x{syntax:'*';inherits:false}${ROOT} .a{--wm-tw-x:1;width:var(--wm-tw-x);--tw-xy:2}`,
    );
  });

  it("does not prefix the root twice", async () => {
    expect(await run(`${ROOT} .a{}`)).toBe(`${ROOT} .a{}`);
    expect(await run(`${ROOT}.dark{}`)).toBe(`${ROOT}.dark{}`);
  });

  it("scopes selectors inside @media, @supports and @container", async () => {
    expect(await run("@media (min-width:1px){.a{}}")).toBe(`@media (min-width:1px){${ROOT} .a{}}`);
    expect(await run("@supports (display:grid){.a{}}")).toBe(
      `@supports (display:grid){${ROOT} .a{}}`,
    );
    expect(await run("@container (min-width:1px){.a{}}")).toBe(
      `@container (min-width:1px){${ROOT} .a{}}`,
    );
  });

  it("leaves files matched by skip untouched", async () => {
    const css = "body.theme-dark{--x:1}@layer a{.b{}}";
    expect(await run(css, "harness/fake-host.css", (file) => file.endsWith("fake-host.css"))).toBe(
      "body.theme-dark{--x:1}@layer a{.b{}}",
    );
  });
});
