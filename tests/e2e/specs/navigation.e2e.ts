import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { ROOT, VIEW_TYPE, installConsoleSpy, openView, pluginProblems } from "../support";
import { de } from "../texts";

const WORKSPACE_FILE = ".obsidian/workspace.json";
/** The start route: the community settings. */
const COMMUNITIES = { name: "settings", section: "communities" };
/** The view the history test opens with a test-only route (see there). */
const PROBE = "[data-e2e=probe]";

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

/** The route of the probe view. */
const probeRoute = () =>
  browser.executeObsidian(({ app }, type) => {
    const leaf = app.workspace
      .getLeavesOfType(type)
      .find((candidate) => candidate.view.containerEl.dataset["e2e"] === "probe");
    return leaf?.getViewState().state?.["route"];
  }, VIEW_TYPE);

const control = (label: string) =>
  browser.$(`${PROBE} ${ROOT} [data-testid=frame-navigation] button[aria-label="${label}"]`);

/** ADR 0008 and its amendment: a fixed tab with its own history; Obsidian keeps the route. */
describe("navigation and view state in Obsidian", function () {
  it("keeps the route in the leaf's view state", async function () {
    await installConsoleSpy();
    await openView();
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).toBeDisplayed();
    expect(await viewState()).toMatchObject({
      type: VIEW_TYPE,
      state: { route: COMMUNITIES },
    });
    await expect(
      browser.$(ROOT).$("[data-testid=frame-navigation] li button[aria-current=page]"),
    ).toHaveText(de.shell.frame.settings);
    // No step yet, so the frame shows no history controls.
    await expect(browser.$(ROOT).$("[data-testid=frame-history]")).not.toExist();
  });

  it("falls back to the start route for a broken or unknown state", async function () {
    for (const state of [{ route: { name: "gone" } }, { route: 42 }, { route: null }, {}]) {
      await setViewState(state);
      expect(await viewState()).toMatchObject({ state: { route: COMMUNITIES } });
    }
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).toBeDisplayed();
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
    expect(saved).toEqual([{ route: COMMUNITIES }]);
  });

  it("stays in its tab when a note is opened while it is the active tab", async function () {
    // A plain click in the file explorer runs `workspace.getLeaf(Keymap.isModEvent(event))
    // .openFile(file)`, that is `getLeaf(false).openFile(file)` (Obsidian 1.15.1).
    const tabs = await browser.executeObsidian(async ({ app }, type) => {
      const plugin = app.workspace.getLeavesOfType(type)[0];
      if (plugin === undefined) throw new Error("no plugin view");
      app.workspace.setActiveLeaf(plugin, { focus: true });
      const file = app.vault.getFileByPath("Willkommen.md");
      if (file === null) throw new Error("no note");
      const target = app.workspace.getLeaf(false);
      await target.openFile(file);
      const note = app.workspace
        .getLeavesOfType("markdown")
        .find((leaf) => leaf.getViewState().state?.["file"] === "Willkommen.md");
      return {
        pluginType: plugin.getViewState().type,
        sameTab: target === plugin,
        noteInOtherTab: note !== undefined && note !== plugin,
      };
    }, VIEW_TYPE);
    expect(tabs).toEqual({ pluginType: VIEW_TYPE, sameTab: false, noteInOtherTab: true });
    // The plugin tab is in the background now, so its surface is in the DOM but hidden.
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).toExist();
  });

  it("goes back and forward between routes with the frame's controls", async function () {
    // The app has one route so far. This opens a second plugin view, built by the plugin's own
    // view class, whose route table adds a test-only route "probe" with a navigation entry and no
    // screen (it shows not-found).
    await browser.executeObsidian(async ({ app }, type) => {
      type Route = { name: string };
      type Definition = {
        decode(value: unknown): Route;
        equals(a: Route, b: Route): boolean;
        screen(route: Route): unknown;
        menu: readonly unknown[];
      };
      type Internals = { runtime: unknown; surfaces: unknown; definition: Definition };
      const existing = app.workspace.getLeavesOfType(type)[0]?.view;
      if (existing === undefined) throw new Error("no plugin view");
      const { runtime, surfaces, definition } = existing as unknown as Internals;
      const probe: Definition = {
        ...definition,
        decode: (value) =>
          (value as { name?: unknown } | null)?.name === "probe"
            ? { name: "probe" }
            : definition.decode(value),
        equals: (a, b) => JSON.stringify(a) === JSON.stringify(b),
        screen: (route) => (route.name === "probe" ? undefined : definition.screen(route)),
        menu: [
          ...definition.menu,
          { route: { name: "probe" }, label: () => "Probe", icon: "i-lucide-info" },
        ],
      };
      const View = existing.constructor as new (...args: unknown[]) => NonNullable<typeof existing>;
      const leaf = app.workspace.getLeaf("tab");
      const view = new View(leaf, runtime, surfaces, probe);
      view.containerEl.dataset["e2e"] = "probe";
      await leaf.open(view);
    }, VIEW_TYPE);
    const root = browser.$(`${PROBE} ${ROOT}`);
    await expect(root.$("[data-testid=communities-screen]")).toBeDisplayed();
    await expect(root.$("[data-testid=frame-history]")).not.toExist();

    await root.$("[data-testid=frame-navigation]").$("button=Probe").click();
    await expect(root.$("[data-testid=not-found]")).toBeDisplayed();
    await root.$("[data-testid=not-found] button").click();
    await expect(root.$("[data-testid=communities-screen]")).toBeDisplayed();
    expect(await probeRoute()).toEqual(COMMUNITIES);

    await control(de.shell.frame.back).click();
    await expect(root.$("[data-testid=not-found]")).toBeDisplayed();
    expect(await probeRoute()).toEqual({ name: "probe" });
    await control(de.shell.frame.back).click();
    await expect(root.$("[data-testid=communities-screen]")).toBeDisplayed();
    // Nowhere to go back to: the control says so and keeps the focus, never `disabled`.
    await expect(control(de.shell.frame.back)).toHaveAttribute("aria-disabled", "true");
    await expect(control(de.shell.frame.back)).toBeEnabled();
    await expect(control(de.shell.frame.back)).toBeFocused();
    await control(de.shell.frame.forward).click();
    await expect(root.$("[data-testid=not-found]")).toBeDisplayed();
    expect(await probeRoute()).toEqual({ name: "probe" });

    await browser.executeObsidian(({ app }, type) => {
      for (const leaf of app.workspace.getLeavesOfType(type)) {
        if (leaf.view.containerEl.dataset["e2e"] === "probe") leaf.detach();
      }
    }, VIEW_TYPE);
    expect(await pluginProblems()).toEqual([]);
  });

  it("restores the view on its route after Obsidian restarts, with a fresh history", async function () {
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
    expect(restored[0]).toMatchObject({ type: VIEW_TYPE, state: { route: COMMUNITIES } });
    await installConsoleSpy();
    await openView();
    await expect(browser.$(ROOT).$("[data-testid=communities-screen]")).toBeDisplayed();
    expect(await viewState()).toMatchObject({ state: { route: COMMUNITIES } });
    await expect(browser.$(ROOT).$("[data-testid=frame-history]")).not.toExist();
    expect(await pluginProblems()).toEqual([]);
  });
});
