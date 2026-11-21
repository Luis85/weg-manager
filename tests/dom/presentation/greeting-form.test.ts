import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { SettingsService } from "../../../src/application/settings-service";
import { mountSurface } from "../../../src/presentation/mount";
import { testRuntime, type TestRuntimeOptions } from "../../support/runtime";

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

const opened: { close: () => void; dispose: () => Promise<void> }[] = [];

const open = async (options: TestRuntimeOptions = {}) => {
  const test = testRuntime(options);
  const root = document.createElement("div");
  document.body.append(root);
  const close = mountSurface(root, test.runtime);
  opened.push({ close, dispose: () => test.runtime.dispose() });
  await settle();
  const input = () => root.querySelector("[data-testid=greeting-input]") as HTMLInputElement;
  return {
    ...test,
    root,
    input,
    type: async (value: string) => {
      input().value = value;
      input().dispatchEvent(new Event("input"));
      await settle();
    },
    save: async () => {
      root.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true }));
      await settle();
    },
    /** `data.json` changed on disk (Sync), then Obsidian's `onExternalSettingsChange`. */
    syncExternally: async (data: unknown) => {
      test.store.writeExternally(data);
      await test.runtime.runPromise(SettingsService.use((service) => service.reload));
      await settle();
    },
  };
};

afterEach(async () => {
  const surfaces = opened.splice(0);
  for (const { close } of surfaces) close();
  await Promise.all(surfaces.map(({ dispose }) => dispose()));
  document.body.replaceChildren();
});

/** PBI-49: the form is no second, stale copy of the setting. */
describe("GreetingForm follows the setting", () => {
  it("shows the default greeting of the UI language while none is typed", async () => {
    expect((await open({ language: "de" })).input().value).toBe("Hallo von WEG Manager");
    expect((await open({ language: "en" })).input().value).toBe("Hello from WEG Manager");
  });

  it("updates an untouched field when the setting changes outside the view", async () => {
    const form = await open({ store: { initial: { greeting: "Alt" } } });
    expect(form.input().value).toBe("Alt");
    await form.syncExternally({ greeting: "Neu" });
    expect(form.input().value).toBe("Neu");
  });

  it("does not overwrite the synced greeting when saved untouched", async () => {
    const form = await open({ store: { initial: { greeting: "Alt" } } });
    await form.syncExternally({ greeting: "Neu" });
    await form.save();
    expect(
      form.store.saved().map((data) => (data as { greeting?: string }).greeting),
    ).not.toContain("Alt");
    expect(form.root.querySelector("[data-testid=greeting]")?.textContent.trim()).toBe("Neu");
  });

  it("follows a reset to the default greeting", async () => {
    const form = await open({ store: { initial: { greeting: "Alt" } } });
    await form.syncExternally({});
    expect(form.input().value).toBe("Hallo von WEG Manager");
  });

  it("keeps what the user is typing when the setting changes meanwhile", async () => {
    const form = await open({ store: { initial: { greeting: "Alt" } } });
    await form.type("Meine Eingabe");
    await form.syncExternally({ greeting: "Neu" });
    expect(form.input().value).toBe("Meine Eingabe");
  });

  it("follows changes again once the typed greeting is saved", async () => {
    const form = await open({ store: { initial: { greeting: "Alt" } } });
    await form.type("Gespeichert");
    await form.save();
    await form.syncExternally({ greeting: "Neu" });
    expect(form.input().value).toBe("Neu");
  });
});
