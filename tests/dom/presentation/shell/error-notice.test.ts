import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import type { UserMessage } from "../../../../src/application/shell/user-messages";
import { ErrorNotice } from "../../../../src/presentation/shell";
import { mountApp } from "../../../support/surface";
import { testRuntime } from "../../../support/runtime";

const cleanups: (() => Promise<void>)[] = [];

const show = async (message: UserMessage, handlers?: Record<string, () => unknown>) => {
  const test = testRuntime();
  const root = document.createElement("div");
  document.body.append(root);
  const content = defineComponent({
    render: () => h(ErrorNotice, { message, ...(handlers ? { handlers } : {}) }),
  });
  const close = mountApp(root, test.runtime, { content });
  cleanups.push(async () => {
    close();
    await test.runtime.dispose();
  });
  await flushPromises();
  return { ...test, root, buttons: () => [...root.querySelectorAll("button")] };
};

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  document.body.replaceChildren();
});

const base = { severity: "error", title: "Titel", detail: "Was tun." } as const;

describe("ErrorNotice", () => {
  it("renders title and detail without a button when there is no action", async () => {
    const notice = await show(base);
    expect(notice.root.querySelector("[role=alert]")?.textContent).toContain("Titel");
    expect(notice.root.textContent).toContain("Was tun.");
    expect(notice.buttons()).toHaveLength(0);
  });

  it("copies diagnostics by itself", async () => {
    const notice = await show({ ...base, action: "copy-diagnostics" });
    notice.buttons()[0]?.click();
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(notice.clipboard.writes()).toHaveLength(1);
  });

  it("hides an action nobody handles and calls the parent's handler otherwise", async () => {
    const hidden = await show({ ...base, action: "open-settings" });
    expect(hidden.buttons()).toHaveLength(0);
    const calls: string[] = [];
    const handled = await show(
      { ...base, action: "open-settings" },
      {
        "open-settings": () => calls.push("open"),
      },
    );
    expect(handled.buttons()[0]?.textContent).toContain("Einstellungen öffnen");
    handled.buttons()[0]?.click();
    expect(calls).toEqual(["open"]);
  });
});
