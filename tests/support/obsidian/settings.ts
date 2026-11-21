import type { App } from "./app";
import type { Plugin } from "./plugin";

abstract class ValueComponent<T> {
  disabled = false;
  protected changeHandler: ((value: T) => unknown) | undefined;
  abstract getValue(): T;
  abstract setValue(value: T): this;
  onChange(callback: (value: T) => unknown): this {
    this.changeHandler = callback;
    return this;
  }
  setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }
}

export class TextComponent extends ValueComponent<string> {
  readonly inputEl: HTMLInputElement;
  constructor(containerEl: HTMLElement) {
    super();
    this.inputEl = containerEl.ownerDocument.createElement("input");
    containerEl.append(this.inputEl);
    this.inputEl.addEventListener("input", () => this.changeHandler?.(this.inputEl.value));
  }
  getValue(): string {
    return this.inputEl.value;
  }
  setValue(value: string): this {
    this.inputEl.value = value;
    return this;
  }
  setPlaceholder(placeholder: string): this {
    this.inputEl.placeholder = placeholder;
    return this;
  }
  override setDisabled(disabled: boolean): this {
    this.inputEl.disabled = disabled;
    return super.setDisabled(disabled);
  }
  /** Test helper: types a value like a user would. */
  simulateInput(value: string): unknown {
    this.inputEl.value = value;
    return this.changeHandler?.(value);
  }
}

export class ToggleComponent extends ValueComponent<boolean> {
  readonly toggleEl: HTMLElement;
  private value = false;
  constructor(containerEl: HTMLElement) {
    super();
    this.toggleEl = containerEl.ownerDocument.createElement("div");
    containerEl.append(this.toggleEl);
  }
  getValue(): boolean {
    return this.value;
  }
  setValue(value: boolean): this {
    this.value = value;
    return this;
  }
  /** Test helper: flips the toggle like a click. */
  simulateToggle(): unknown {
    if (this.disabled) return undefined;
    this.value = !this.value;
    return this.changeHandler?.(this.value);
  }
}

export class DropdownComponent extends ValueComponent<string> {
  readonly selectEl: HTMLSelectElement;
  constructor(containerEl: HTMLElement) {
    super();
    this.selectEl = containerEl.ownerDocument.createElement("select");
    containerEl.append(this.selectEl);
  }
  addOption(value: string, display: string): this {
    const option = this.selectEl.ownerDocument.createElement("option");
    option.value = value;
    option.textContent = display;
    this.selectEl.append(option);
    return this;
  }
  addOptions(options: Record<string, string>): this {
    for (const [value, display] of Object.entries(options)) this.addOption(value, display);
    return this;
  }
  getValue(): string {
    return this.selectEl.value;
  }
  setValue(value: string): this {
    this.selectEl.value = value;
    return this;
  }
  override setDisabled(disabled: boolean): this {
    this.selectEl.disabled = disabled;
    return super.setDisabled(disabled);
  }
  simulateSelect(value: string): unknown {
    this.selectEl.value = value;
    return this.changeHandler?.(value);
  }
}

export type SettingControl = TextComponent | ToggleComponent | DropdownComponent;

const created: Setting[] = [];

export class Setting {
  readonly settingEl: HTMLElement;
  readonly nameEl: HTMLElement;
  readonly descEl: HTMLElement;
  readonly controlEl: HTMLElement;
  /** Where Obsidian shows a failed `validate` message. */
  readonly validationEl: HTMLElement;
  readonly components: SettingControl[] = [];
  disabled = false;

  constructor(containerEl: HTMLElement) {
    const doc = containerEl.ownerDocument;
    this.settingEl = doc.createElement("div");
    this.settingEl.className = "setting-item";
    this.nameEl = doc.createElement("div");
    this.descEl = doc.createElement("div");
    this.controlEl = doc.createElement("div");
    this.validationEl = doc.createElement("div");
    this.settingEl.append(this.nameEl, this.descEl, this.controlEl, this.validationEl);
    containerEl.append(this.settingEl);
    created.push(this);
  }

  setName(name: string | DocumentFragment): this {
    this.nameEl.replaceChildren(name);
    return this;
  }

  setDesc(desc: string | DocumentFragment): this {
    this.descEl.replaceChildren(desc);
    return this;
  }

  setHeading(): this {
    this.settingEl.classList.add("setting-item-heading");
    return this;
  }

  setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    for (const component of this.components) component.setDisabled(disabled);
    return this;
  }

  addText(callback: (component: TextComponent) => unknown): this {
    return this.add(new TextComponent(this.controlEl), callback);
  }

  addToggle(callback: (component: ToggleComponent) => unknown): this {
    return this.add(new ToggleComponent(this.controlEl), callback);
  }

  addDropdown(callback: (component: DropdownComponent) => unknown): this {
    return this.add(new DropdownComponent(this.controlEl), callback);
  }

  private add<C extends SettingControl>(component: C, callback: (component: C) => unknown): this {
    this.components.push(component);
    callback(component);
    return this;
  }
}

type Predicate = boolean | (() => boolean) | undefined;
const evaluate = (value: Predicate, fallback: boolean): boolean =>
  typeof value === "function" ? value() : (value ?? fallback);

type ControlDefinition = {
  type: "text" | "toggle" | "dropdown";
  key: string;
  defaultValue?: unknown;
  options?: Record<string, string>;
  disabled?: Predicate;
  validate?: (value: never) => string | void | Promise<string | void>;
};

export type DefinitionItem = {
  name: string;
  desc?: string | DocumentFragment;
  control?: ControlDefinition;
  visible?: Predicate;
  searchable?: Predicate;
};

/**
 * Renders `getSettingDefinitions()` the way Obsidian 1.13+ does for the parts this plugin uses:
 * text, toggle and dropdown controls plus plain rows. A failed `validate` shows its message in
 * `validationEl` and skips `setControlValue`.
 */
export abstract class SettingTab {
  readonly containerEl: HTMLElement = document.createElement("div");
  settingItems: DefinitionItem[] = [];
  constructor(readonly app: App) {}

  getSettingDefinitions(): DefinitionItem[] {
    return [];
  }

  getControlValue(_key: string): unknown {
    return undefined;
  }

  setControlValue(_key: string, _value: unknown): void | Promise<void> {}

  /** Test helper: whether the tab is shown (between `display()` and `hide()`). */
  shown = false;

  /** As in Obsidian 1.15.1: re-reads the definitions and re-renders the tab while it is shown. */
  update(): void {
    this.settingItems = this.getSettingDefinitions();
    if (this.shown) this.render();
  }

  display(): void {
    this.shown = true;
    this.update();
  }

  hide(): void {
    this.shown = false;
    this.containerEl.replaceChildren();
  }

  private render(): void {
    this.containerEl.replaceChildren();
    for (const item of this.settingItems) {
      if (evaluate(item.visible, true)) this.renderItem(item);
    }
  }

  /** Test helper: resolves once the latest `setControlValue` call has settled. */
  pending: Promise<unknown> = Promise.resolve();

  private renderItem(item: DefinitionItem): void {
    const setting = new Setting(this.containerEl).setName(item.name);
    if (item.desc !== undefined) setting.setDesc(item.desc);
    const control = item.control;
    if (control === undefined) return;
    const value = this.getControlValue(control.key) ?? control.defaultValue;
    const commit = (next: unknown) => {
      this.pending = Promise.resolve(control.validate?.(next as never)).then((issue) => {
        setting.validationEl.textContent = typeof issue === "string" ? issue : "";
        if (typeof issue === "string" && issue !== "") return undefined;
        return this.setControlValue(control.key, next);
      });
      return this.pending;
    };
    if (control.type === "text") {
      setting.addText((text) =>
        text.setValue(typeof value === "string" ? value : "").onChange(commit),
      );
    } else if (control.type === "toggle") {
      setting.addToggle((toggle) => toggle.setValue(value === true).onChange(commit));
    } else {
      setting.addDropdown((dropdown) =>
        dropdown
          .addOptions(control.options ?? {})
          .setValue(String(value))
          .onChange(commit),
      );
    }
    setting.setDisabled(evaluate(control.disabled, false));
  }
}

export abstract class PluginSettingTab extends SettingTab {
  constructor(
    app: App,
    readonly plugin: Plugin,
  ) {
    super(app);
  }
}

/** Test helper: the live `Setting` objects rendered inside a container, in order. */
export const settingsIn = (containerEl: HTMLElement): Setting[] =>
  created.filter((setting) => containerEl.contains(setting.settingEl));
