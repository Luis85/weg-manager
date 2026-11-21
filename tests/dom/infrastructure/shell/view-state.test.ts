import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import type { ViewNavigation } from "../../../../src/presentation/shell/host";
import { runtimes } from "../../../support/composable";
import { testSurface, type TestRoute } from "../../../support/surface";

vi.mock("obsidian", () => import("@test/obsidian"));

const { App } = await import("@test/obsidian");
const { ShellView, SHELL_VIEW_TYPE } =
  await import("../../../../src/infrastructure/obsidian/shell/shell-view");
const { openRoute } = await import("../../../../src/infrastructure/obsidian/shell/open-route");

const { make, disposeAll } = runtimes();

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const noop = (): void => undefined;

type TestView = InstanceType<typeof ShellView<TestRoute>>;

/** A workspace whose view type shows the test routes. */
const workspace = () => {
  const { runtime, logger } = make();
  const app = new App();
  const surfaces = new Set<() => void>();
  app.workspace.registerViewCreator(
    SHELL_VIEW_TYPE,
    (leaf) => new ShellView(leaf as never, runtime, surfaces, testSurface()) as never,
  );
  const open = async (state?: unknown) => {
    const leaf = app.workspace.getLeaf(true);
    await leaf.setViewState({
      type: SHELL_VIEW_TYPE,
      ...(state === undefined ? {} : { state: state as Record<string, unknown> }),
    });
    await settle();
    return { leaf, view: leaf.view as unknown as TestView };
  };
  return { app, open, logger };
};

const shown = (view: TestView) =>
  view.contentEl.querySelector("[data-testid=screen] h2")?.textContent;
const routeShown = (view: TestView) =>
  view.contentEl.querySelector("[data-testid=route]")?.textContent;
const button = (view: TestView, label: string): HTMLButtonElement => {
  const found = [...view.contentEl.querySelectorAll("button")].find((el) =>
    el.textContent.includes(label),
  );
  if (found === undefined) throw new Error(`no button "${label}"`);
  return found;
};

/** One of the frame's history controls, found by its accessible name. */
const control = (view: TestView, label: string): HTMLButtonElement => {
  const found = view.contentEl.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  if (found === null) throw new Error(`no control "${label}"`);
  return found;
};

afterEach(async () => {
  document.body.replaceChildren();
  await disposeAll();
});

describe("ShellView state", () => {
  it("starts on the start route and reports it in getState", async () => {
    const { open } = workspace();
    const { view, leaf } = await open();
    expect(view.getState()).toEqual({ route: { name: "first" } });
    expect(leaf.getViewState()).toEqual({
      type: SHELL_VIEW_TYPE,
      state: { route: { name: "first" } },
    });
    expect(shown(view)).toBe("First screen");
  });

  it("restores the route of a saved state", async () => {
    const { open } = workspace();
    const { view } = await open({ route: { name: "item", id: "7" } });
    expect(routeShown(view)).toBe('{"name":"item","id":"7"}');
    expect(view.getState()).toEqual({ route: { name: "item", id: "7" } });
  });

  it.each([
    ["an unknown route", { route: { name: "settings" } }],
    ["a broken parameter", { route: { name: "item", id: 7 } }],
    ["a route that is no object", { route: "second" }],
    ["no route", { scroll: 3 }],
    ["null", null],
    ["a string", "second"],
  ])("falls back to the start route for %s, without throwing", async (_, state) => {
    const { open } = workspace();
    const { view } = await open({ route: { name: "second" } });
    expect(shown(view)).toBe("Second screen");
    await view.setState(state, { history: false });
    await settle();
    expect(view.getState()).toEqual({ route: { name: "first" } });
    expect(shown(view)).toBe("First screen");
  });

  it("is a fixed tab, so a file opened while it is active goes to another tab", async () => {
    const { open } = workspace();
    const { view } = await open();
    expect(view.navigation).toBe(false);
  });

  it("records a navigation from inside the surface in its own history and saves the layout", async () => {
    const { app, open } = workspace();
    const { view } = await open();
    const saves = app.workspace.layoutSaves;
    expect(control(view, "Zurück").disabled).toBe(true);
    button(view, "open item").click();
    await settle();
    expect(view.getState()).toEqual({ route: { name: "item", id: "42" } });
    expect(control(view, "Zurück").disabled).toBe(false);
    expect(app.workspace.layoutSaves).toBe(saves + 1);
  });

  it("goes back and forward in its own history, and Obsidian keeps each route", async () => {
    const { app, open } = workspace();
    const { view } = await open();
    button(view, "Second").click();
    await settle();
    button(view, "open item").click();
    await settle();
    const saves = app.workspace.layoutSaves;
    control(view, "Zurück").click();
    await settle();
    expect(view.getState()).toEqual({ route: { name: "second" } });
    control(view, "Zurück").click();
    await settle();
    expect(shown(view)).toBe("First screen");
    expect(view.getState()).toEqual({ route: { name: "first" } });
    control(view, "Vorwärts").click();
    await settle();
    expect(shown(view)).toBe("Second screen");
    expect(app.workspace.layoutSaves).toBe(saves + 3);
    expect([control(view, "Zurück").disabled, control(view, "Vorwärts").disabled]).toEqual([
      false,
      false,
    ]);
  });

  it("records nothing when the route does not change, and never asks Obsidian to", async () => {
    const { app, open } = workspace();
    const { view } = await open();
    const saves = app.workspace.layoutSaves;
    button(view, "First").click();
    await settle();
    const same = { history: false };
    await view.setState({ route: { name: "first" } }, same);
    expect(app.workspace.layoutSaves).toBe(saves);
    expect(control(view, "Zurück").disabled).toBe(true);
    const changed = { history: false };
    await view.setState({ route: { name: "second" } }, changed);
    expect([same.history, changed.history]).toEqual([false, false]);
  });

  it("starts the history at the state a new view is opened with", async () => {
    const { open } = workspace();
    const { view } = await open({ route: { name: "second" } });
    expect(shown(view)).toBe("Second screen");
    expect(control(view, "Zurück").disabled).toBe(true);
  });

  it("treats a state set on an open view as a navigation", async () => {
    const { open } = workspace();
    const { view } = await open();
    await view.setState({ route: { name: "second" } }, { history: false });
    await settle();
    control(view, "Zurück").click();
    await settle();
    expect(shown(view)).toBe("First screen");
  });

  it("keeps two views on their own routes", async () => {
    const { open } = workspace();
    const first = await open();
    const second = await open({ route: { name: "second" } });
    button(first.view, "open item").click();
    await settle();
    expect(shown(first.view)).toBe("Item screen");
    expect(shown(second.view)).toBe("Second screen");
    expect(second.view.getState()).toEqual({ route: { name: "second" } });
  });

  it("mounts on the route that arrived while the surface was loading", async () => {
    const { runtime } = make();
    const app = new App();
    const seen: unknown[] = [];
    let resolve: () => void = noop;
    const ready = new Promise<void>((done) => {
      resolve = done;
    });
    const load = async () => {
      await ready;
      return {
        mountSurface: (
          _root: HTMLElement,
          _runtime: unknown,
          options: { navigation: ViewNavigation<TestRoute> },
        ) => {
          seen.push(options.navigation.current());
          return () => undefined;
        },
      };
    };
    const view = new ShellView(
      app.workspace.getLeaf(true) as never,
      runtime,
      new Set(),
      testSurface(),
      load as never,
    );
    const opening = view.onOpen();
    await view.setState({ route: { name: "second" } }, { history: false });
    resolve();
    await opening;
    expect(seen).toEqual([{ name: "second" }]);
    await view.onClose();
  });
});

describe("openRoute", () => {
  it("opens a new view on the route", async () => {
    const { app } = workspace();
    await openRoute(app.workspace as never, { name: "second" });
    await settle();
    const leaves = app.workspace.getLeavesOfType(SHELL_VIEW_TYPE);
    expect(leaves).toHaveLength(1);
    expect(leaves[0]?.getViewState().state).toEqual({ route: { name: "second" } });
    expect(app.workspace.revealed).toEqual(leaves);
  });

  it("reveals the open view and sets its route, as a step in the view's history", async () => {
    const { app, open } = workspace();
    const { leaf, view } = await open();
    await openRoute(app.workspace as never, { name: "item", id: "3" });
    await settle();
    expect(app.workspace.getLeavesOfType(SHELL_VIEW_TYPE)).toEqual([leaf]);
    expect(app.workspace.revealed).toEqual([leaf]);
    expect(routeShown(view)).toBe('{"name":"item","id":"3"}');
    control(view, "Zurück").click();
    await settle();
    expect(shown(view)).toBe("First screen");
  });

  it("starts a view it opens on the route, with nothing to go back to", async () => {
    const { app } = workspace();
    await openRoute(app.workspace as never, { name: "second" });
    await settle();
    const view = app.workspace.getLeavesOfType(SHELL_VIEW_TYPE)[0]?.view as unknown as TestView;
    expect(shown(view)).toBe("Second screen");
    expect(control(view, "Zurück").disabled).toBe(true);
  });

  it("without a route, opens a view on the start route or reveals the open one as it is", async () => {
    const { app } = workspace();
    await openRoute(app.workspace as never);
    await settle();
    const [leaf] = app.workspace.getLeavesOfType(SHELL_VIEW_TYPE);
    const view = leaf?.view as unknown as TestView;
    expect(view.getState()).toEqual({ route: { name: "first" } });
    button(view, "Second").click();
    await settle();
    await openRoute(app.workspace as never);
    await settle();
    expect(view.getState()).toEqual({ route: { name: "second" } });
    expect(app.workspace.getLeavesOfType(SHELL_VIEW_TYPE)).toEqual([leaf]);
    expect(app.workspace.revealed).toEqual([leaf, leaf]);
  });
});
