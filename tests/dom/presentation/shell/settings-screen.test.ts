import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { de } from "../../../../src/application/messages";
import { routesOf, settingsRoute } from "../../../../src/application/shell/routes";
import { SettingsScreen, mountSurface } from "../../../../src/presentation/shell";
import {
  memoryNavigation,
  type SettingsSectionPart,
  type SurfaceDefinition,
} from "../../../../src/presentation/shell/host";
import { runtimes } from "../../../support/composable";
import { preloadSurface } from "../../../support/preload";
import { plainElements } from "../../../support/surface";
import { eventually } from "../../../support/wait";

await preloadSurface();

/** The settings screen with two test sections; `data` has a badge. */
const SettingsRoute = settingsRoute(["general", "data"]);
type SettingsRoute = typeof SettingsRoute.Type;
const START: SettingsRoute = { name: "settings", section: "general" };

const section = (title: string) =>
  defineComponent({ setup: () => () => h("h2", { "data-testid": "section" }, title) });
const Badge = defineComponent({ setup: () => () => h("span", { "data-testid": "badge" }, "3") });

const PARTS: Readonly<Record<SettingsRoute["section"], SettingsSectionPart>> = {
  general: { label: () => "Allgemein", component: async () => section("General section") },
  data: {
    label: (catalog) => `Daten ${catalog.shell.language}`,
    component: async () => section("Data section"),
    badge: async () => Badge,
  },
};

/** A surface of the settings screen alone: no module adds an entry to the frame's navigation. */
const definition = (
  sections: Readonly<Record<string, SettingsSectionPart>>,
  menu: SurfaceDefinition<SettingsRoute>["menu"] = [],
): SurfaceDefinition<SettingsRoute> => ({
  ...routesOf(SettingsRoute, START),
  screen: () => async () => SettingsScreen,
  menu,
  sections,
});

const { make, disposeAll } = runtimes();
const closes: (() => void)[] = [];

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const mounted = async (
  options: {
    readonly sections?: Readonly<Record<string, SettingsSectionPart>>;
    readonly start?: SettingsRoute;
    readonly menu?: SurfaceDefinition<SettingsRoute>["menu"];
    readonly language?: "de" | "en";
  } = {},
) => {
  const { runtime } = make(options.language === undefined ? {} : { language: options.language });
  const root = document.createElement("div");
  document.body.append(root);
  const surface = definition(options.sections ?? PARTS, options.menu);
  const navigation = memoryNavigation(surface, options.start ?? START);
  closes.push(mountSurface(root, runtime, { surface, navigation, elements: plainElements(root) }));
  await eventually(() =>
    expect(root.querySelector("[data-testid=settings-screen]")).not.toBeNull(),
  );
  await settle();
  const nav = () => root.querySelector<HTMLElement>("[data-testid=settings-sections]");
  const tabs = () => [...(nav()?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
  const shown = () => root.querySelector("[data-testid=section]")?.textContent;
  /** The entries of the frame's navigation, not the settings screen's own. */
  const entries = () => [
    ...root.querySelectorAll<HTMLButtonElement>(
      "nav:not([data-testid=settings-sections]) li button",
    ),
  ];
  return { root, navigation, nav, tabs, shown, entries };
};

afterEach(async () => {
  for (const close of closes.splice(0)) close();
  document.body.replaceChildren();
  await disposeAll();
});

describe("the settings screen (ADR 0008, amendment 22.11.2026)", () => {
  it("shows the route's section under a labelled navigation of every section", async () => {
    const screen = await mounted();
    expect(screen.nav()?.tagName).toBe("NAV");
    expect(screen.nav()?.getAttribute("aria-label")).toBe(de.shell.frame.settingsSections);
    expect(screen.tabs().map((tab) => tab.textContent.trim())).toEqual(["Allgemein", "Daten de 3"]);
    expect(screen.tabs().map((tab) => tab.getAttribute("aria-current"))).toEqual(["page", null]);
    expect(screen.shown()).toBe("General section");
  });

  it("opens a section as a route of its own and keeps the focus on its entry", async () => {
    const screen = await mounted();
    const [, data] = screen.tabs();
    data?.focus();
    data?.click();
    await settle();
    expect(screen.navigation.current()).toStrictEqual({ name: "settings", section: "data" });
    expect(screen.shown()).toBe("Data section");
    expect(screen.tabs().map((tab) => tab.getAttribute("aria-current"))).toEqual([null, "page"]);
    // The screen stayed mounted across its sections: the entry the user chose keeps the focus.
    expect(document.activeElement).toBe(screen.tabs()[1]);
    expect(document.activeElement).toBe(data);
    screen.navigation.back();
    await settle();
    expect(screen.shown()).toBe("General section");
  });

  it("starts on the section the view's state names", async () => {
    const screen = await mounted({ start: { name: "settings", section: "data" } });
    expect(screen.shown()).toBe("Data section");
    expect(screen.tabs()[1]?.getAttribute("aria-current")).toBe("page");
  });

  it("shows one section alone without a navigation", async () => {
    const screen = await mounted({ sections: { general: PARTS.general } });
    expect(screen.nav()).toBeNull();
    expect(screen.shown()).toBe("General section");
  });

  it("shows not-found for a section no module contributes", async () => {
    const screen = await mounted({
      sections: { general: PARTS.general },
      start: { name: "settings", section: "data" },
    });
    expect(screen.shown()).toBeUndefined();
    expect(screen.root.querySelector("[data-testid=not-found]")).not.toBeNull();
  });
});

describe("the frame's settings entry (ADR 0008, amendment 2026-11-22)", () => {
  it("is the shell's: it opens the first section and is current on every section", async () => {
    const screen = await mounted({ start: { name: "settings", section: "data" } });
    expect(screen.entries().map((entry) => entry.textContent.trim())).toEqual(["Einstellungen"]);
    expect(screen.entries()[0]?.getAttribute("aria-current")).toBe("page");
    screen.entries()[0]?.click();
    await settle();
    expect(screen.navigation.current()).toStrictEqual({ name: "settings", section: "general" });
    expect(screen.shown()).toBe("General section");
    expect(screen.entries()[0]?.getAttribute("aria-current")).toBe("page");
  });

  it("opens the section that comes first in the sections, whichever that is", async () => {
    const screen = await mounted({
      sections: { data: PARTS.data, general: PARTS.general },
      start: { name: "settings", section: "general" },
    });
    screen.entries()[0]?.click();
    await settle();
    expect(screen.navigation.current()).toStrictEqual({ name: "settings", section: "data" });
  });

  it("comes after the modules' entries, and is worded in the UI language", async () => {
    const screen = await mounted({
      language: "en",
      menu: [{ route: START, label: () => "Overview", icon: "i-lucide-info" }],
    });
    expect(screen.entries().map((entry) => entry.textContent.trim())).toEqual([
      "Overview",
      "Settings",
    ]);
  });
});
