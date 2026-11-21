export type RecordedNotice = {
  readonly text: string;
  readonly message: string | DocumentFragment;
  readonly duration: number | undefined;
  readonly notice: Notice;
};

const notices: RecordedNotice[] = [];

export const recordedNotices = (): readonly RecordedNotice[] => notices;

let failNext = false;

/** Makes the next `new Notice` throw once (to provoke a defect inside the Notifier). */
export const failNextNotice = (): void => {
  failNext = true;
};

export const clearNotices = (): void => {
  notices.length = 0;
  failNext = false;
};

const textOf = (message: string | DocumentFragment): string =>
  typeof message === "string" ? message : (message.textContent ?? "");

/** Records every notice; `messageEl` holds the rendered message for DOM assertions. */
export class Notice {
  readonly noticeEl: HTMLElement;
  readonly messageEl: HTMLElement;
  readonly containerEl: HTMLElement;
  hidden = false;

  constructor(message: string | DocumentFragment, duration?: number) {
    if (failNext) {
      failNext = false;
      throw new Error("notice failed");
    }
    this.containerEl = document.createElement("div");
    this.noticeEl = this.containerEl;
    this.messageEl = document.createElement("div");
    this.containerEl.append(this.messageEl);
    if (typeof message === "string") this.messageEl.textContent = message;
    else this.messageEl.append(message.cloneNode(true));
    notices.push({ text: textOf(message), message, duration, notice: this });
  }

  setMessage(message: string | DocumentFragment): this {
    this.messageEl.replaceChildren(typeof message === "string" ? message : message.cloneNode(true));
    return this;
  }

  hide(): void {
    this.hidden = true;
  }
}
