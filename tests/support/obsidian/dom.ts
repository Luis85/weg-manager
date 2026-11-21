type DomElementInfo = {
  cls?: string | string[];
  text?: string;
  attr?: Record<string, string | number | boolean | null>;
  title?: string;
  parent?: Node;
};

type Creator = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  info?: DomElementInfo | string,
  callback?: (el: HTMLElementTagNameMap[K]) => void,
) => HTMLElementTagNameMap[K];

const classesOf = (cls: string | string[] | undefined): string[] =>
  cls === undefined ? [] : Array.isArray(cls) ? cls : cls.split(" ");

const applyAttributes = (el: HTMLElement, attr: DomElementInfo["attr"]): void => {
  for (const [name, value] of Object.entries(attr ?? {})) {
    if (value !== null && value !== false) el.setAttribute(name, String(value));
  }
};

const applyInfo = (el: HTMLElement, info: DomElementInfo | string | undefined): void => {
  if (info === undefined) return;
  const options = typeof info === "string" ? { cls: info } : info;
  el.classList.add(...classesOf(options.cls));
  if (options.text !== undefined) el.textContent = options.text;
  if (options.title !== undefined) el.title = options.title;
  applyAttributes(el, options.attr);
};

const creatorFor = (
  ownerDocument: () => Document,
  append: (parent: unknown, el: HTMLElement) => void,
): Creator =>
  function (this: unknown, tag, info, callback) {
    const el = ownerDocument().createElement(tag);
    applyInfo(el, info);
    append(this, el);
    callback?.(el);
    return el;
  };

const appendTo = (parent: unknown, el: HTMLElement) => (parent as Node).appendChild(el);

/** Installs the subset of Obsidian's DOM extensions this plugin uses (dom tests only). */
export const installDomExtensions = (win: Window & typeof globalThis): void => {
  const nodeProto = win.Node.prototype as unknown as Record<string, unknown>;
  const elementProto = win.HTMLElement.prototype as unknown as Record<string, unknown>;
  const fragmentProto = win.DocumentFragment.prototype as unknown as Record<string, unknown>;
  const docOf = function (this: Node) {
    return this.ownerDocument ?? win.document;
  };

  for (const proto of [elementProto, fragmentProto]) {
    proto["createEl"] = function (this: Node, ...args: Parameters<Creator>) {
      return creatorFor(() => docOf.call(this), appendTo).apply(this, args);
    };
    proto["createDiv"] = function (
      this: Node,
      info?: DomElementInfo | string,
      cb?: (el: HTMLDivElement) => void,
    ) {
      return (this as unknown as { createEl: Creator }).createEl("div", info, cb);
    };
    proto["createSpan"] = function (
      this: Node,
      info?: DomElementInfo | string,
      cb?: (el: HTMLSpanElement) => void,
    ) {
      return (this as unknown as { createEl: Creator }).createEl("span", info, cb);
    };
  }
  nodeProto["empty"] = function (this: Node) {
    while (this.firstChild) this.removeChild(this.firstChild);
  };
  nodeProto["setText"] = function (this: Node, text: string) {
    this.textContent = text;
  };
  elementProto["addClass"] = function (this: HTMLElement, ...classes: string[]) {
    this.classList.add(...classes);
  };
  elementProto["removeClass"] = function (this: HTMLElement, ...classes: string[]) {
    this.classList.remove(...classes);
  };
  elementProto["toggleClass"] = function (
    this: HTMLElement,
    classes: string | string[],
    value: boolean,
  ) {
    for (const name of Array.isArray(classes) ? classes : [classes])
      this.classList.toggle(name, value);
  };
  elementProto["getText"] = function (this: HTMLElement) {
    return this.textContent ?? "";
  };

  const globals = win as unknown as Record<string, unknown>;
  globals["createFragment"] = (callback?: (fragment: DocumentFragment) => void) => {
    const fragment = win.document.createDocumentFragment();
    callback?.(fragment);
    return fragment;
  };
  globals["createEl"] = creatorFor(
    () => win.document,
    () => undefined,
  );
  globals["createDiv"] = (info?: DomElementInfo | string) =>
    (globals["createEl"] as Creator)("div", info);
  globals["activeDocument"] = win.document;
  globals["activeWindow"] = win;
};
