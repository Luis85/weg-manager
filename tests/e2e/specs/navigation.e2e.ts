import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { ROOT, VIEW_TYPE, installConsoleSpy, openView, pluginProblems } from "../support";

const WORKSPACE_FILE = ".obsidian/workspace.json";

/** The view state of the first plugin view, as Obsidian reads it for the layout. */
const viewState = () =>
  browser.executeObsidian(
    ({ app }, type) => app.workspace.getLeavesOfType(type)[0]?.getViewState(),
    VIEW_TYPE,
  );

/** Sets the first plugin view's state, as Obsidian does when it restores a layout. */
const setViewState = (state: unknown) =>
  browser.executeObsidian(
    async ({ app }, type, next) => {
      await app.workspace
        .getLeavesOfType(type)[0]
        ?.setViewState({ type, state: next as Record<string, unknown> });
    },
    VIEW_TYPE,
    state,
  );

const historyLengths = () =>
  browser.executeObsidian(({ app }, type) => {
    const leaf = app.workspace.getLeavesOfType(type)[0] as unknown as {
      history: { backHistory: unknown[]; forwardHistory: unknown[] };
    };
    return [leaf.history.backHistory.length, leaf.history.forwardHistory.length];
  }, VIEW_TYPE);

/** Clicks Obsidian's own back or forward button in the view header. */
const clickHistoryButton = (direction: "back" | "forward") =>
  browser.executeObsidian(
    ({ app }, type, which) => {
      const view = app.workspace.getLeavesOfType(type)[0]?.view as unknown as {
        backButtonEl: HTMLElement;
        forwardButtonEl: HTMLElement;
      };
      (which === "back" ? view.backButtonEl : view.forwardButtonEl).click();
    },
    VIEW_TYPE,
    direction,
  );

/** ADR 0008: the route lives in Obsidian's view state, layout and leaf history. */
describe("navigation and view state in Obsidian", function () {
  it("keeps the route in the leaf's view state", async function () {
    await installConsoleSpy();
    await openView();
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toBeDisplayed();
    expect(await viewState()).toMatchObject({
      type: VIEW_TYPE,
      state: { route: { name: "welcome" } },
    });
    await expect(browser.$(ROOT).$("nav button[aria-current=page]")).toHaveText("Start");
  });

  it("falls back to the start route for a broken or unknown state", async function () {
    for (const state of [{ route: { name: "gone" } }, { route: 42 }, { route: null }, {}]) {
      await setViewState(state);
      expect(await viewState()).toMatchObject({ state: { route: { name: "welcome" } } });
    }
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toBeDisplayed();
    expect(await pluginProblems()).toEqual([]);
  });

  it("writes the route into the saved workspace layout", async function () {
    const saved = await browser.executeObsidian(
      async ({ app }, type, file) => {
        await (app.workspace as unknown as { saveLayout(): Promise<void> }).saveLayout();
        const text = await app.vault.adapter.read(file);
        const found: unknown[] = [];
        const walk = (node: unknown) => {
          if (typeof node !== "object" || node === null) return;
          const item = node as { type?: string; state?: { type?: string; state?: unknown } };
          if (item.type === "leaf" && item.state?.type === type) found.push(item.state.state);
          for (const value of Object.values(node)) walk(value);
        };
        walk(JSON.parse(text));
        return found;
      },
      VIEW_TYPE,
      WORKSPACE_FILE,
    );
    expect(saved).toEqual([{ route: { name: "welcome" } }]);
  });

  it("records a navigation in the leaf's history, so Obsidian's back and forward work", async function () {
    // The app has one route so far. A second, test-only route goes into this view's route table:
    // the view decodes it, the surface has no screen for it and shows not-found.
    await browser.executeObsidian(({ app }, type) => {
      type Definition = {
        decode(value: unknown): unknown;
        equals(a: unknown, b: unknown): boolean;
      };
      const view = app.workspace.getLeavesOfType(type)[0]?.view as unknown as {
        definition: Definition;
        navigationOfView: { navigate(route: unknown): void };
      };
      const original = view.definition;
      view.definition = {
        ...original,
        decode: (value: unknown) =>
          (value as { name?: unknown } | null)?.name === "probe"
            ? { name: "probe" }
            : original.decode(value),
        equals: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b),
      };
      view.navigationOfView.navigate({ name: "probe" });
    }, VIEW_TYPE);
    await expect(browser.$(ROOT).$("[data-testid=not-found]")).toBeDisplayed();
    expect(await viewState()).toMatchObject({ state: { route: { name: "probe" } } });
    expect(await historyLengths()).toEqual([1, 0]);

    await clickHistoryButton("back");
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toBeDisplayed();
    expect(await viewState()).toMatchObject({ state: { route: { name: "welcome" } } });
    expect(await historyLengths()).toEqual([0, 1]);

    await clickHistoryButton("forward");
    await expect(browser.$(ROOT).$("[data-testid=not-found]")).toBeDisplayed();
    expect(await viewState()).toMatchObject({ state: { route: { name: "probe" } } });

    // The way back from not-found is a navigation too.
    await browser.$(ROOT).$("[data-testid=not-found] button").click();
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toBeDisplayed();
    expect(await historyLengths()).toEqual([2, 0]);
    expect(await pluginProblems()).toEqual([]);
  });

  it("restores the view on its route after Obsidian restarts", async function () {
    await browser.executeObsidian(async ({ app }) => {
      await (app.workspace as unknown as { saveLayout(): Promise<void> }).saveLayout();
    });
    await browser.reloadObsidian();
    // Restored from the saved layout, before anything opens a view.
    const restored = await browser.executeObsidian(
      ({ app }, type) => app.workspace.getLeavesOfType(type).map((leaf) => leaf.getViewState()),
      VIEW_TYPE,
    );
    expect(restored).toHaveLength(1);
    expect(restored[0]).toMatchObject({ type: VIEW_TYPE, state: { route: { name: "welcome" } } });
    await installConsoleSpy();
    await openView();
    await expect(browser.$(ROOT).$("[data-testid=greeting]")).toBeDisplayed();
    expect(await viewState()).toMatchObject({ state: { route: { name: "welcome" } } });
    expect(await pluginProblems()).toEqual([]);
  });
});
