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
  /** Ribbon icons still attached to the DOM (a plugin may remove its own icon element). */
  readonly ribbonIcons: RibbonIcon[];
  readonly notices: typeof recordedNotices;
  readonly saved: unknown[];
  runCommand(id: string): unknown;
  /** Makes the next `addCommand` throw once. */
  failNextAddCommand(): void;
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
  failAddCommand: boolean;
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
    if (value.failAddCommand) {
      value.failAddCommand = false;
      throw new Error("addCommand failed");
    }
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
    const value = state(this);
    const el = document.createElement("div");
    el.setAttribute("aria-label", title);
    el.addEventListener("click", (event) => callback(event));
    document.body.append(el);
    const entry = { icon, title, el };
    (value.registry as PluginRegistry & { allRibbonIcons: RibbonIcon[] }).allRibbonIcons.push(
      entry,
    );
    this.register(() => el.remove());
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
  const allRibbonIcons: RibbonIcon[] = [];
  const registry: PluginRegistry & { allRibbonIcons: RibbonIcon[] } = {
    allRibbonIcons,
    commands: new Map(),
    views: new Map(),
    settingTabs: [],
    get ribbonIcons() {
      return allRibbonIcons.filter((entry) => entry.el.isConnected);
    },
    notices: recordedNotices,
    saved: [],
    runCommand: (id) => {
      const command = registry.commands.get(id);
      if (command === undefined) throw new Error(`unknown command ${id}`);
      return command.callback?.() ?? command.checkCallback?.(false);
    },
    failNextAddCommand: () => {
      state(double).failAddCommand = true;
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
    failAddCommand: false,
    gate: undefined,
  });
  return { plugin, registry, app };
};
