import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";

/**
 * Helpers shared by the e2e specs. Code passed to `executeObsidian` is serialised and runs inside
 * Obsidian, so it cannot use closures or module-level helpers (hence the e2e lint override).
 */

export const PLUGIN_ID = "weg-manager";
export const VIEW_TYPE = "weg-manager-view";
export const ROOT = ".weg-manager-root";
export const DATA_FILE = ".obsidian/plugins/weg-manager/data.json";

type Captured = { readonly kind: string; readonly text: string };

/** Records console errors/warnings and uncaught errors from now on, in the main window. */
export const installConsoleSpy = () =>
  browser.executeObsidian(() => {
    const target = window as unknown as { wegManagerCaptured?: Captured[] };
    if (target.wegManagerCaptured !== undefined) return;
    const captured: Captured[] = [];
    target.wegManagerCaptured = captured;
    const text = (args: unknown[]) =>
      args
        .map((arg) => (arg instanceof Error ? `${arg.name}: ${arg.message}` : String(arg)))
        .join(" ");
    for (const kind of ["error", "warn"] as const) {
      const original = console[kind].bind(console);
      console[kind] = (...args: unknown[]) => {
        captured.push({ kind, text: text(args) });
        original(...args);
      };
    }
    window.addEventListener("error", (event) => {
      // Chromium reports a ResizeObserver whose layout settles over more than one frame as an
      // error event (it happens when a pop-out opens or resizes). It is a notification, not a
      // thrown error, so it is not a problem of this plugin.
      if (String(event.message).startsWith("ResizeObserver loop")) return;
      captured.push({ kind: "uncaught", text: String(event.message) });
    });
    window.addEventListener("unhandledrejection", (event) => {
      captured.push({ kind: "unhandledrejection", text: String(event.reason) });
    });
  });

/** Everything the spy saw that concerns this plugin, Vue or Nuxt UI, plus every uncaught error. */
export const pluginProblems = async (): Promise<Captured[]> => {
  const captured = await browser.executeObsidian(
    () => (window as unknown as { wegManagerCaptured?: Captured[] }).wegManagerCaptured ?? [],
  );
  return captured.filter(
    (entry) =>
      entry.kind === "uncaught" ||
      entry.kind === "unhandledrejection" ||
      /weg-manager|\[Vue|nuxt/i.test(entry.text),
  );
};

/**
 * Waits until `read()` returns `expected` (compared as JSON), and fails showing the last value seen.
 * For a read that follows a write: the index follows it about 100 ms later, so a bare read taken
 * right after the write may still show the state before.
 */
export const eventually = async <T>(
  read: () => Promise<T>,
  expected: T,
  what: string,
): Promise<void> => {
  let last: T | undefined;
  try {
    await browser.waitUntil(async () => {
      last = await read();
      return JSON.stringify(last) === JSON.stringify(expected);
    });
  } catch {
    throw new Error(
      `${what}: expected ${JSON.stringify(expected)}, last seen ${JSON.stringify(last)}`,
    );
  }
};

/** The text of every notice Obsidian shows in the main window or the active one. */
export const noticeTexts = () =>
  browser.executeObsidian(() =>
    [document, activeDocument].flatMap((doc) =>
      [...doc.querySelectorAll(".notice")].map((el) => el.textContent ?? ""),
    ),
  );

/** Waits until Obsidian shows a notice that contains `text`. */
export const expectNotice = (text: string) =>
  browser.waitUntil(async () => (await noticeTexts()).some((shown) => shown.includes(text)), {
    timeoutMsg: `no notice said ${text}`,
  });

/**
 * Waits until Obsidian's metadata cache has worked through everything queued so far. A freshly
 * started Obsidian indexes the vault's notes in the background, and its `changed` events would
 * land in the middle of a spec that records events. Obsidian's cache works through its queue in
 * order, so a note edited now is the last in line: once its own `changed` and the `resolved` after
 * it have come, every earlier note is done too.
 */
export const cacheIdle = () =>
  browser.executeObsidian(async ({ app }) => {
    const file = app.vault.getMarkdownFiles()[0];
    if (file === undefined) return;
    await new Promise<void>((done) => {
      let changed = false;
      const refs = [
        app.metadataCache.on("changed", (edited) => {
          if (edited === file) changed = true;
        }),
        app.metadataCache.on("resolved", () => {
          if (!changed) return;
          for (const ref of refs) app.metadataCache.offref(ref);
          done();
        }),
      ];
      void app.vault.process(file, (text) => `${text}\n`);
    });
  });

export const openView = () => browser.executeObsidianCommand(`${PLUGIN_ID}:open-view`);

export const leafCount = () =>
  browser.executeObsidian(({ app }, type) => app.workspace.getLeavesOfType(type).length, VIEW_TYPE);

/** The plugin's `data.json`, or `null` when it does not exist. */
export const readData = () =>
  browser.executeObsidian(async ({ app }, file) => {
    if (!(await app.vault.adapter.exists(file))) return null;
    return JSON.parse(await app.vault.adapter.read(file)) as Record<string, unknown>;
  }, DATA_FILE);

export const writeData = (data: unknown) =>
  browser.executeObsidian(
    async ({ app }, file, text) => {
      await app.vault.adapter.write(file, text);
    },
    DATA_FILE,
    JSON.stringify(data),
  );

/**
 * The plugin's rows in the real settings tab: their names and how many text fields they hold.
 * The settings window is closed again afterwards.
 */
export const settingsTabContent = () =>
  browser.executeObsidian(({ app }, id) => {
    const setting = (
      app as unknown as {
        setting: {
          open(): void;
          close(): void;
          openTabById(tab: string): void;
          activeTab?: { containerEl: HTMLElement };
        };
      }
    ).setting;
    setting.open();
    setting.openTabById(id);
    const tab = setting.activeTab?.containerEl;
    const names = [...(tab?.querySelectorAll(".setting-item-name") ?? [])].map(
      (el) => el.textContent ?? "",
    );
    const inputs = tab?.querySelectorAll("input").length ?? -1;
    setting.close();
    return { names, inputs };
  }, PLUGIN_ID);

/**
 * The log level dropdown of the plugin's real settings tab: its value and whether it is disabled.
 * With `choose`, it first picks that value as a user does (a `change` event). The settings window
 * is closed again afterwards. The save runs after the change event: a caller that wants it waits
 * for its effect (`data.json`, a notice).
 */
export const logLevelControl = (choose?: string) =>
  browser.executeObsidian(
    ({ app }, id, value) => {
      const setting = (
        app as unknown as {
          setting: {
            open(): void;
            close(): void;
            openTabById(tab: string): void;
            activeTab?: { containerEl: HTMLElement };
          };
        }
      ).setting;
      setting.open();
      setting.openTabById(id);
      const select = setting.activeTab?.containerEl.querySelector("select");
      if (select && value !== null) {
        select.value = value;
        select.dispatchEvent(new Event("change"));
      }
      const state = { value: select?.value ?? null, disabled: select?.disabled ?? null };
      setting.close();
      return state;
    },
    PLUGIN_ID,
    choose ?? null,
  );

/** Disables and re-enables the plugin, as a user does in Settings → Community plugins. */
export const reloadPlugin = async () => {
  await obsidianPage.disablePlugin(PLUGIN_ID);
  await obsidianPage.enablePlugin(PLUGIN_ID);
};

/** "obsidian" is Obsidian's dark base theme, "moonstone" its light one (internal API). */
export const setColorScheme = (scheme: "dark" | "light") =>
  browser.executeObsidian(
    ({ app }, theme) => {
      (app as unknown as { changeTheme(name: string): void }).changeTheme(theme);
    },
    scheme === "dark" ? "obsidian" : "moonstone",
  );
