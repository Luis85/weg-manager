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
  readonly components: SettingControl[] = [];
  disabled = false;

  constructor(containerEl: HTMLElement) {
    const doc = containerEl.ownerDocument;
    this.settingEl = doc.createElement("div");
    this.settingEl.className = "setting-item";
    this.nameEl = doc.createElement("div");
    this.descEl = doc.createElement("div");
    this.controlEl = doc.createElement("div");
    this.settingEl.append(this.nameEl, this.descEl, this.controlEl);
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

export abstract class SettingTab {
  readonly containerEl: HTMLElement = document.createElement("div");
  constructor(readonly app: App) {}
  abstract display(): void;
  hide(): void {
    this.containerEl.replaceChildren();
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
