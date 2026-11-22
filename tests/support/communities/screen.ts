import { flushPromises } from "@vue/test-utils";
import { vi } from "vitest";
import type { Route, SettingsSection } from "../../../src/application/routes";
import { appSurface } from "../../../src/presentation/app-surface";
import { memoryNavigation } from "../../../src/presentation/shell/host";
import { testRuntime, type TestRuntimeOptions } from "../runtime";
import { mountApp } from "../surface";

export { FOLDER, communityId, communityNote } from "./fixture";

/** Lets Vue, the runtime and the portals settle. */
export const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

/** The in-memory note store of a screen, to seed notes. */
export type Memory = ReturnType<typeof testRuntime>["notes"];

export type ScreenOptions = TestRuntimeOptions & {
  /** Seeds notes before the index builds, as the vault holds them at start. */
  readonly seed?: (notes: Memory) => void;
  /** False keeps the index from building: no `VaultReady` yet. */
  readonly ready?: boolean;
};

const opened: { close: () => void; dispose: () => Promise<void> }[] = [];

/** Closes every surface `openCommunities` mounted and disposes its runtime; for an `afterEach`. */
export const closeAll = async () => {
  const surfaces = opened.splice(0);
  for (const { close } of surfaces) close();
  await Promise.all(surfaces.map(({ dispose }) => dispose()));
  document.body.replaceChildren();
};

/** Waits until `check` passes: the index follows a write after its batch delay. */
const until = (check: () => void) => vi.waitFor(check, { timeout: 2000, interval: 20 });

/** The test id each settings section's root carries. */
const SECTION_SCREENS: Readonly<Record<SettingsSection, string>> = {
  communities: "communities-screen",
  "data-issues": "data-issues-screen",
};

/**
 * The app on a section of the settings screen over the in-memory store, with handles to drive it:
 * query by test id, type into an input, click, and wait until the screen shows what a test
 * expects (the index follows a write about 100 ms later, as in Obsidian).
 */
export const openSettings = async (section: SettingsSection, options: ScreenOptions = {}) => {
  const test = testRuntime(options);
  options.seed?.(test.notes);
  const root = document.createElement("div");
  document.body.append(root);
  const route: Route = { name: "settings", section };
  const close = mountApp(root, test.runtime, { navigation: memoryNavigation(appSurface, route) });
  opened.push({ close, dispose: () => test.runtime.dispose() });
  if (options.ready !== false) await test.vaultReady();
  // The screen and its section are lazily loaded components: wait until they are there.
  await vi.waitFor(
    () => {
      if (root.querySelector(`[data-testid=${SECTION_SCREENS[section]}]`) === null)
        throw new Error("no screen");
    },
    { timeout: 5000, interval: 10 },
  );
  await settle();
  const all = (id: string) => [...root.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)];
  const q = (id: string) => all(id)[0];
  const text = (id: string) => q(id)?.textContent.replace(/\s+/g, " ").trim();
  const input = (id: string) => q(id) as HTMLInputElement;
  const type = async (id: string, value: string) => {
    input(id).value = value;
    input(id).dispatchEvent(new Event("input"));
    await settle();
  };
  const click = async (element: Element | undefined) => {
    if (!(element instanceof HTMLElement)) throw new Error("nothing to click");
    element.click();
    await settle();
  };
  const button = (label: string) =>
    [...root.querySelectorAll("button")].find(
      (candidate) =>
        candidate.textContent.trim() === label || candidate.getAttribute("aria-label") === label,
    );
  const names = () => all("community-name").map((element) => element.textContent.trim());
  return { ...test, root, close, all, q, text, input, type, click, button, until, names };
};

/** The app on the community settings, the start route. */
export const openCommunities = (options: ScreenOptions = {}) =>
  openSettings("communities", options);

export type OpenScreen = Awaited<ReturnType<typeof openCommunities>>;

/** Fills the community form, one field after the other, as a person would. */
export const fill = async (
  screen: OpenScreen,
  values: Partial<Record<"name" | "short_code" | "kind" | "unit_label", string>> & {
    readonly color?: string;
  },
) => {
  // One after the other, as a person types: each field's validators see the ones before.
  await (["name", "short_code", "kind", "unit_label"] as const).reduce((previous, key) => {
    const value = values[key];
    return value === undefined ? previous : previous.then(() => screen.type(`field-${key}`, value));
  }, Promise.resolve());
  if (values.color !== undefined) {
    await screen.click(
      screen.root.querySelector(`input[type=radio][value="${values.color}"]`) ?? undefined,
    );
  }
};

/** Submits the open form. */
export const save = (screen: OpenScreen) => screen.click(screen.q("community-save"));
