import { App } from "./app";
import { Component } from "./component";
import { clearNotices, recordedNotices } from "./notice";
import type { PluginSettingTab } from "./settings";
import type { ViewCreator } from "./views";

export type PluginManifest = {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly minAppVersion: string;
  readonly author: string;
  readonly description: string;
  readonly isDesktopOnly?: boolean;
};

export type Command = {
  readonly id: string;
  readonly name: string;
  readonly callback?: () => unknown;
  readonly checkCallback?: (checking: boolean) => boolean | void;
  readonly hotkeys?: readonly unknown[];
  readonly icon?: string;
};

export type RibbonIcon = {
  readonly icon: string;
  readonly title: string;
  readonly el: HTMLElement;
};

export type PluginRegistry = {
  readonly commands: Map<string, Command>;
  readonly views: Map<string, ViewCreator>;
  readonly settingTabs: PluginSettingTab[];
  /**
   * This plugin's live entries in `app.workspace.leftRibbon.items` (those that still have a
   * button), whether or not the element is attached right now.
   */
  readonly ribbonIcons: RibbonIcon[];
  readonly notices: typeof recordedNotices;
  readonly saved: unknown[];
  runCommand(id: string): unknown;
  /** Makes the next `addCommand` throw once; with `after`, the one after that many succeed. */
  failNextAddCommand(options?: { readonly after?: number }): void;
  /** Replaces `data.json` as Sync or another program would; Obsidian then calls `onExternalSettingsChange`. */
  writeExternally(data: unknown): void;
  /** Makes every later `loadData` fail (`true`) or succeed again (`false`). */
  setFailLoadData(fail: boolean): void;
  /** Holds `loadData` until `releaseLoadData()` is called. */
  holdLoadData(): void;
  releaseLoadData(): void;
  /** Calls `load()` and waits for an async `onload` to settle. */
  load(): Promise<void>;
};

export const TEST_MANIFEST: PluginManifest = {
  id: "weg-manager",
  name: "WEG Manager",
  version: "0.1.0",
  minAppVersion: "1.15.1",
  author: "Test",
  description: "Test manifest",
  isDesktopOnly: true,
};

type Internals = {
  registry: PluginRegistry;
  data: unknown;
  failLoadData: boolean;
  /** How many more `addCommand` calls succeed before one throws; `undefined` for none. */
  failAddCommandAfter: number | undefined;
  gate: { promise: Promise<void>; release: () => void } | undefined;
};

const noop = (): void => undefined;

const internals = new WeakMap<Plugin, Internals>();
const state = (plugin: Plugin): Internals => {
  const value = internals.get(plugin);
  if (value === undefined) throw new Error("plugin not created through createTestPlugin");
  return value;
};

export abstract class Plugin extends Component {
  constructor(
    readonly app: App,
    readonly manifest: PluginManifest,
  ) {
    super();
  }

  override onload(): void | Promise<void> {}

  async loadData(): Promise<unknown> {
    const value = state(this);
    if (value.gate !== undefined) await value.gate.promise;
    if (value.failLoadData) throw new Error("data.json unreadable");
    return structuredClone(value.data);
  }

  async saveData(data: unknown): Promise<void> {
    const value = state(this);
    value.data = structuredClone(data);
    value.registry.saved.push(value.data);
  }

  addCommand(command: Command): Command {
    const value = state(this);
    if (value.failAddCommandAfter === 0) {
      value.failAddCommandAfter = undefined;
      throw new Error("addCommand failed");
    }
    if (value.failAddCommandAfter !== undefined) value.failAddCommandAfter -= 1;
    const id = `${this.manifest.id}:${command.id}`;
    value.registry.commands.set(command.id, command);
    this.register(() => value.registry.commands.delete(command.id));
    return { ...command, id };
  }

  removeCommand(commandId: string): void {
    state(this).registry.commands.delete(commandId);
  }

  addRibbonIcon(
    icon: string,
    title: string,
    callback: (event: MouseEvent) => unknown,
  ): HTMLElement {
    // As in Obsidian 1.15.1: the entry id is `<plugin id>:<title>`, and unload releases the entry.
    const { leftRibbon } = this.app.workspace;
    const id = `${this.manifest.id}:${title}`;
    const el = leftRibbon.addRibbonItemButton(id, icon, title, callback);
    this.register(() => {
      leftRibbon.removeRibbonAction(id);
      el.remove();
    });
    return el;
  }

  addSettingTab(tab: PluginSettingTab): void {
    const value = state(this);
    value.registry.settingTabs.push(tab);
    this.register(() => {
      tab.hide();
      const index = value.registry.settingTabs.indexOf(tab);
      if (index !== -1) value.registry.settingTabs.splice(index, 1);
    });
  }

  registerView(type: string, creator: ViewCreator): void {
    const value = state(this);
    value.registry.views.set(type, creator);
    this.app.workspace.registerViewCreator(type, creator);
    this.register(() => {
      value.registry.views.delete(type);
      this.app.workspace.unregisterViewCreator(type);
      // Obsidian closes open views of an unregistered type when the plugin unloads.
      for (const leaf of this.app.workspace.getLeavesOfType(type)) void leaf.detach();
    });
  }
}

/** Accepts the production plugin class, which is typed against the real `obsidian` package. */
export type PluginClass<P> = new (...args: never[]) => P;

export const createTestPlugin = <P extends object>(
  PluginClass: PluginClass<P>,
  options: { readonly data?: unknown; readonly failLoadData?: boolean; readonly app?: App } = {},
): { plugin: P; registry: PluginRegistry; app: App } => {
  clearNotices();
  const app = options.app ?? new App();
  const Constructor = PluginClass as unknown as new (app: App, manifest: PluginManifest) => P;
  const plugin = new Constructor(app, TEST_MANIFEST);
  const double = plugin as unknown as Plugin;
  const registry: PluginRegistry = {
    commands: new Map(),
    views: new Map(),
    settingTabs: [],
    get ribbonIcons() {
      return app.workspace.leftRibbon.items.flatMap((item) =>
        item.id.startsWith(`${TEST_MANIFEST.id}:`) && item.buttonEl !== undefined
          ? [{ icon: item.icon, title: item.title, el: item.buttonEl }]
          : [],
      );
    },
    notices: recordedNotices,
    saved: [],
    runCommand: (id) => {
      const command = registry.commands.get(id);
      if (command === undefined) throw new Error(`unknown command ${id}`);
      return command.callback?.() ?? command.checkCallback?.(false);
    },
    failNextAddCommand: (failure) => {
      state(double).failAddCommandAfter = failure?.after ?? 0;
    },
    writeExternally: (data) => {
      state(double).data = structuredClone(data);
    },
    setFailLoadData: (fail) => {
      state(double).failLoadData = fail;
    },
    holdLoadData: () => {
      let release: () => void = noop;
      const promise = new Promise<void>((resolve) => {
        release = resolve;
      });
      state(double).gate = { promise, release };
    },
    releaseLoadData: () => {
      const gate = state(double).gate;
      state(double).gate = undefined;
      gate?.release();
    },
    load: async () => {
      double.load();
      await double.lastOnloadResult;
    },
  };
  internals.set(double, {
    registry,
    data: options.data,
    failLoadData: options.failLoadData ?? false,
    failAddCommandAfter: undefined,
    gate: undefined,
  });
  return { plugin, registry, app };
};
