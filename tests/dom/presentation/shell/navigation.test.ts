import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { memoryNavigation } from "../../../../src/presentation/shell/host";
import { useRoute } from "../../../../src/presentation/shell";
import { runtimes } from "../../../support/composable";
import { preloadSurface } from "../../../support/preload";
import { appSurface } from "../../../../src/presentation/app-surface";
import { mountApp, mountTest, testSurface, type TestRoute } from "../../../support/surface";
import { eventually } from "../../../support/wait";

// "starts on the community settings" waits for the app surface's lazily loaded screen and context.
// Their first import (the whole communities module) is what once took it past a second on a loaded
// machine; paying it at file load leaves the wait to cover only rendering.
await preloadSurface();

const { make, disposeAll } = runtimes();
const closes: (() => void)[] = [];

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const newRoot = (): HTMLElement => {
  const root = document.createElement("div");
  document.body.append(root);
  return root;
};

const mounted = async (
  options: { readonly start?: TestRoute; readonly language?: "de" | "en" } = {},
) => {
  const { runtime } = make(options.language ? { language: options.language } : {});
  const root = newRoot();
  const surface = testSurface();
  const navigation = memoryNavigation(surface, options.start);
  const { close } = mountTest(root, runtime, surface, navigation);
  closes.push(close);
  await settle();
  return { root, navigation, surface };
};

const shown = (root: ParentNode) => root.querySelector("[data-testid=screen] h2")?.textContent;
const routeShown = (root: ParentNode) => root.querySelector("[data-testid=route]")?.textContent;
const navButtons = (root: ParentNode) => [
  ...root.querySelectorAll<HTMLButtonElement>("nav:not([data-testid=settings-sections]) li button"),
];
/** Whether a navigation button carries the current page's bar (an inset shadow). */
const barred = (button: HTMLButtonElement) =>
  [...button.classList].some((name) => name.startsWith("wm:shadow-[inset"));
const buttonNamed = (root: ParentNode, label: string): HTMLButtonElement => {
  const button = [...root.querySelectorAll("button")].find((el) => el.textContent.includes(label));
  if (button === undefined) throw new Error(`no button "${label}"`);
  return button;
};

afterEach(async () => {
  for (const close of closes.splice(0)) close();
  document.body.replaceChildren();
  await disposeAll();
});

describe("navigation in a surface", () => {
  it("shows the screen of the view's route and marks its entry as the current page", async () => {
    const { root } = await mounted({ start: { name: "second" } });
    expect(shown(root)).toBe("Second screen");
    expect(navButtons(root).map((button) => button.textContent.trim())).toEqual([
      "First",
      "Second",
    ]);
    expect(navButtons(root).map((button) => button.getAttribute("aria-current"))).toEqual([
      null,
      "page",
    ]);
  });

  it("marks an entry as the current page on every route of its screen, whatever the parameters", async () => {
    const surface = testSurface({
      menu: [
        { route: { name: "first" }, label: () => "First", icon: "i-lucide-info", order: 10 },
        {
          route: { name: "item", id: "1" },
          label: () => "Items",
          icon: "i-lucide-info",
          order: 20,
        },
      ],
    });
    const { runtime } = make();
    const root = newRoot();
    const navigation = memoryNavigation(surface, { name: "item", id: "7" });
    closes.push(mountTest(root, runtime, surface, navigation).close);
    await settle();
    expect(navButtons(root).map((button) => button.getAttribute("aria-current"))).toEqual([
      null,
      "page",
    ]);
    navigation.navigate({ name: "item", id: "8" });
    await settle();
    expect(navButtons(root).map((button) => button.getAttribute("aria-current"))).toEqual([
      null,
      "page",
    ]);
    navigation.navigate({ name: "second" });
    await settle();
    expect(navButtons(root).map((button) => button.getAttribute("aria-current"))).toEqual([
      null,
      null,
    ]);
  });

  it("navigates through the view when an entry is chosen", async () => {
    const { root, navigation } = await mounted();
    buttonNamed(root, "Second").click();
    await settle();
    expect(navigation.visited).toEqual([{ name: "first" }, { name: "second" }]);
    expect(shown(root)).toBe("Second screen");
    expect(buttonNamed(root, "Second").getAttribute("aria-current")).toBe("page");
  });

  it("lets a screen navigate and read its route's parameters", async () => {
    const { root } = await mounted();
    buttonNamed(root, "open item").click();
    await settle();
    expect(shown(root)).toBe("Item screen");
    expect(routeShown(root)).toBe('{"name":"item","id":"42"}');
    expect(navButtons(root).map((button) => button.getAttribute("aria-current"))).toEqual([
      null,
      null,
    ]);
  });

  it("follows a route the view sets from outside (state restore, back and forward)", async () => {
    const { root, navigation } = await mounted();
    navigation.navigate({ name: "item", id: "7" });
    await settle();
    expect(routeShown(root)).toBe('{"name":"item","id":"7"}');
    navigation.navigate({ name: "first" });
    await settle();
    expect(shown(root)).toBe("First screen");
  });

  it("shows not-found with a way back to the start route", async () => {
    const { root, navigation } = await mounted({ start: { name: "missing" } });
    const notFound = root.querySelector("[data-testid=not-found]");
    expect(notFound?.querySelector("h2")?.textContent).toBe("Nicht gefunden");
    expect(notFound?.querySelector("p")?.textContent).toBe(
      "Was du öffnen wolltest, gibt es nicht mehr. Vielleicht wurde es gelöscht oder umbenannt.",
    );
    buttonNamed(notFound ?? root, "Zur Startseite").click();
    await settle();
    expect(navigation.current()).toEqual({ name: "first" });
    expect(shown(root)).toBe("First screen");
  });

  it("lets a screen show not-found for a record that is gone", async () => {
    const { root, navigation } = await mounted({ start: { name: "item", id: "gone" } });
    expect(root.querySelector("[data-testid=not-found] h2")?.textContent).toBe("Nicht gefunden");
    buttonNamed(root, "Zur Startseite").click();
    await settle();
    expect(navigation.current()).toEqual({ name: "first" });
  });

  it("words not-found in English", async () => {
    const { root } = await mounted({ start: { name: "missing" }, language: "en" });
    const notFound = root.querySelector("[data-testid=not-found]");
    expect(notFound?.querySelector("h2")?.textContent).toBe("Not found");
    expect(notFound?.querySelector("p")?.textContent).toBe(
      "What you wanted to open no longer exists. It may have been deleted or renamed.",
    );
    expect(buttonNamed(notFound ?? root, "Go to the start page")).toBeDefined();
  });

  it("keeps two surfaces on their own routes", async () => {
    const first = await mounted();
    const second = await mounted({ start: { name: "second" } });
    buttonNamed(first.root, "open item").click();
    await settle();
    expect(shown(first.root)).toBe("Item screen");
    expect(shown(second.root)).toBe("Second screen");
  });

  it("loads the screen of a route name once, however often it is visited", async () => {
    const { runtime } = make();
    const base = testSurface();
    const loads: string[] = [];
    const surface = testSurface({
      screen: (route) => {
        const load = base.screen(route);
        return load === undefined
          ? undefined
          : () => {
              loads.push(route.name);
              return load();
            };
      },
    });
    const navigation = memoryNavigation(surface);
    closes.push(mountTest(newRoot(), runtime, surface, navigation).close);
    await settle();
    const root = document.body;
    const visit = async (route: TestRoute) => {
      navigation.navigate(route);
      await settle();
    };
    await visit({ name: "second" });
    await visit({ name: "first" });
    await visit({ name: "item", id: "1" });
    await visit({ name: "item", id: "2" });
    await visit({ name: "first" });
    expect(shown(root)).toBe("First screen");
    expect(loads.toSorted()).toEqual(["first", "item", "second"]);
  });

  it("refuses a component that asks for the route outside a mounted surface, naming the cause", () => {
    const Lost = defineComponent({
      setup() {
        useRoute();
        return () => h("p");
      },
    });
    expect(() => mount(Lost)).toThrow("useRouting() outside a mounted surface");
  });

  it("stops following the view when the surface closes", async () => {
    const { runtime } = make();
    const surface = testSurface();
    const navigation = memoryNavigation(surface);
    const { close } = mountTest(newRoot(), runtime, surface, navigation);
    await settle();
    expect(navigation.listeners()).toBe(1);
    close();
    expect(navigation.listeners()).toBe(0);
  });
});

/** One of the frame's history controls, found by its accessible name. */
const control = (root: ParentNode, label: string) => {
  const found = root.querySelector<HTMLButtonElement>(`nav button[aria-label="${label}"]`);
  if (found === null) throw new Error(`no control "${label}"`);
  return found;
};
/** Whether each control can go somewhere: never `disabled`, only `aria-disabled` (WCAG 2.4.3). */
const enabled = (root: ParentNode) =>
  ["Zurück", "Vorwärts"].map((label) => {
    const button = control(root, label);
    expect(button.disabled).toBe(false);
    return button.getAttribute("aria-disabled") !== "true";
  });
const historyShown = (root: ParentNode) =>
  root.querySelector("[data-testid=frame-history]") !== null;

describe("history in a surface", () => {
  it("goes back and forward with the frame's controls, shown once there is a step", async () => {
    const { root, navigation } = await mounted();
    expect(historyShown(root)).toBe(false);
    buttonNamed(root, "Second").click();
    await settle();
    buttonNamed(root, "open item").click();
    await settle();
    expect(enabled(root)).toEqual([true, false]);
    control(root, "Zurück").click();
    await settle();
    expect(shown(root)).toBe("Second screen");
    control(root, "Zurück").click();
    await settle();
    expect(shown(root)).toBe("First screen");
    expect(enabled(root)).toEqual([false, true]);
    // A control with nowhere to go keeps its focus and ignores the click.
    control(root, "Zurück").focus();
    control(root, "Zurück").click();
    await settle();
    expect(shown(root)).toBe("First screen");
    expect(document.activeElement).toBe(control(root, "Zurück"));
    control(root, "Vorwärts").click();
    await settle();
    expect(shown(root)).toBe("Second screen");
    expect(navigation.history()).toStrictEqual({
      back: [{ name: "first" }],
      current: { name: "second" },
      forward: [{ name: "item", id: "42" }],
    });
  });

  it("records nothing when the current entry is chosen again", async () => {
    const { root, navigation } = await mounted();
    buttonNamed(root, "First").click();
    await settle();
    expect(historyShown(root)).toBe(false);
    expect(navigation.history().back).toEqual([]);
  });

  it("lets a screen go back through useHistory", async () => {
    const { root } = await mounted();
    expect(buttonNamed(root, "go back").disabled).toBe(true);
    buttonNamed(root, "open item").click();
    await settle();
    buttonNamed(root, "go back").click();
    await settle();
    expect(shown(root)).toBe("First screen");
  });

  it("labels the controls in English", async () => {
    const { root } = await mounted({ language: "en" });
    buttonNamed(root, "Second").click();
    await settle();
    expect(control(root, "Back").getAttribute("aria-disabled")).toBeNull();
    expect(control(root, "Forward").getAttribute("aria-disabled")).toBe("true");
  });
});

describe("the app frame", () => {
  it("has a labelled navigation and content region, with buttons reachable by keyboard", async () => {
    const { root } = await mounted();
    const nav = root.querySelector("nav");
    expect(nav?.getAttribute("aria-label")).toBe("Ansichten");
    expect(root.querySelector("section")?.getAttribute("aria-label")).toBe("Inhalt");
    for (const button of navButtons(root)) {
      expect(button.getAttribute("type")).toBe("button");
      expect(button.tabIndex).toBe(0);
    }
  });

  it("lays out by the width of its container, not the window", async () => {
    const { root } = await mounted();
    const frame = root.querySelector("[data-testid=app-frame]");
    expect(frame?.classList.contains("wm:@container")).toBe(true);
    expect(frame?.firstElementChild?.classList.contains("wm:@min-[860px]:flex-row")).toBe(true);
    expect(frame?.querySelector("nav")?.classList.contains("wm:@min-[860px]:w-56")).toBe(true);
  });

  it("marks the current page with a bar too, not by colour alone", async () => {
    const { root } = await mounted({ start: { name: "second" } });
    expect(navButtons(root).map(barred)).toEqual([false, true]);
  });

  it("states the UI language, so the browser hyphenates and reads its texts in it", async () => {
    const german = await mounted();
    expect(german.root.querySelector("[data-testid=app-frame]")?.getAttribute("lang")).toBe("de");
    const english = await mounted({ language: "en" });
    expect(english.root.querySelector("[data-testid=app-frame]")?.getAttribute("lang")).toBe("en");
  });

  it("has no settings entry when no module adds a settings section", async () => {
    const { root } = await mounted();
    expect(navButtons(root).map((button) => button.textContent.trim())).toEqual([
      "First",
      "Second",
    ]);
  });

  it("fills its context area from the surface definition, and shows none without", async () => {
    const Switch = defineComponent({ setup: () => () => h("p", "community switch") });
    const { runtime } = make();
    const withContext = newRoot();
    closes.push(
      mountTest(withContext, runtime, testSurface({ context: async () => Switch })).close,
    );
    const without = newRoot();
    closes.push(mountTest(without, runtime).close);
    await settle();
    expect(withContext.querySelector("nav [data-testid=frame-context]")?.textContent).toBe(
      "community switch",
    );
    expect(without.querySelector("[data-testid=frame-context]")).toBeNull();
  });

  it("starts on the settings, after week, matters and contacts as in the sitemap, with the switch in the context area", async () => {
    const { runtime } = make();
    const root = newRoot();
    closes.push(mountApp(root, runtime));
    await settle();
    expect(navButtons(root).map((button) => button.textContent.trim())).toEqual([
      "Woche",
      "Vorgänge",
      "Kontakte",
      "Einstellungen",
    ]);
    expect(navButtons(root).map((button) => button.getAttribute("aria-current"))).toEqual([
      null,
      null,
      null,
      "page",
    ]);
    await eventually(() =>
      expect(root.querySelector("section [data-testid=communities-screen]")).not.toBeNull(),
    );
    await eventually(() =>
      expect(root.querySelector("nav [data-testid=community-switch]")).not.toBeNull(),
    );
    // Each entry carries its bundled icon, drawn (an empty svg is a missing icon).
    await eventually(() =>
      expect(
        navButtons(root).map((button) => button.querySelector("svg")?.innerHTML ?? ""),
      ).not.toContain(""),
    );
  });

  it("keeps the settings entry current on every section, and opens the communities from another", async () => {
    const { runtime } = make();
    const root = newRoot();
    const navigation = memoryNavigation(appSurface, {
      name: "settings",
      section: "data-issues",
    } as const);
    closes.push(mountApp(root, runtime, { navigation }));
    await settle();
    const settings = () => navButtons(root)[3] as HTMLButtonElement;
    expect(settings().textContent.trim()).toBe("Einstellungen");
    expect(settings().getAttribute("aria-current")).toBe("page");
    expect(barred(settings())).toBe(true);
    settings().click();
    await settle();
    expect(navigation.current()).toEqual({ name: "settings", section: "communities" });
    expect(settings().getAttribute("aria-current")).toBe("page");
  });

  it("words the entries in English", async () => {
    const { runtime } = make({ language: "en" });
    const root = newRoot();
    closes.push(mountApp(root, runtime));
    await settle();
    expect(navButtons(root).map((button) => button.textContent.trim())).toEqual([
      "Week",
      "Matters",
      "Contacts",
      "Settings",
    ]);
  });
});
