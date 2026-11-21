import { afterEach, describe, expect, it } from "vitest";
import { bindHostTheme } from "../../../src/presentation/theme";

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  document.body.className = "";
  document.body.replaceChildren();
});

describe("bindHostTheme (Review Focus 3)", () => {
  it("follows theme switches on the owner body without a remount", async () => {
    document.body.classList.add("theme-light");
    const root = document.createElement("div");
    document.body.append(root);
    const release = bindHostTheme(root);
    expect(root.classList.contains("light")).toBe(true);
    expect(root.classList.contains("dark")).toBe(false);

    document.body.classList.replace("theme-light", "theme-dark");
    await tick();
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.classList.contains("light")).toBe(false);

    document.body.classList.replace("theme-dark", "theme-light");
    await tick();
    expect(root.classList.contains("light")).toBe(true);
    release();
  });

  it("stops following and restores the original classes on release", async () => {
    document.body.classList.add("theme-dark");
    const root = document.createElement("div");
    root.className = "light keep";
    document.body.append(root);
    const release = bindHostTheme(root);
    expect(root.classList.contains("dark")).toBe(true);
    release();
    expect([...root.classList].toSorted()).toEqual(["keep", "light"]);
    document.body.classList.replace("theme-dark", "theme-light");
    document.body.classList.replace("theme-light", "theme-dark");
    await tick();
    expect([...root.classList].toSorted()).toEqual(["keep", "light"]);
    expect(() => release()).not.toThrow();
  });

  it("observes the root's own document, not the main one", async () => {
    const popout = document.implementation.createHTMLDocument("pop-out");
    const root = popout.createElement("div");
    popout.body.append(root);
    const release = bindHostTheme(root);
    document.body.classList.add("theme-dark");
    await tick();
    expect(root.classList.contains("dark")).toBe(false);
    popout.body.classList.add("theme-dark");
    await tick();
    expect(root.classList.contains("dark")).toBe(true);
    release();
  });
});
