import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, type ComponentInternalInstance } from "vue";
import { SettingsService } from "../../../../src/application/shell/settings-service";
import { encodeSettings } from "../../../../src/domain/shell";
import GreetingForm from "../../../../src/presentation/shell/components/GreetingForm.vue";
import { mountSurface } from "../../../../src/presentation/shell";
import { testRuntime, type TestRuntimeOptions } from "../../../support/runtime";

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

/** The form's `save` command as `<script setup>` holds it (dev builds expose `setupState`). */
type SaveRefs = Readonly<Record<"pending" | "value" | "error" | "message", { value: unknown }>>;

describe("GreetingForm closed during a save", () => {
  it("finishes the save, keeps file and settings equal and leaves the closed form alone", async () => {
    let instance: ComponentInternalInstance | null = null;
    const content = defineComponent({
      render: () =>
        h(GreetingForm, {
          onVnodeMounted: (vnode) => {
            instance = vnode.component;
          },
        }),
    });
    const test = testRuntime({ store: { uncancellableSaves: true } });
    const root = document.createElement("div");
    document.body.append(root);
    const close = mountSurface(root, test.runtime, { content });
    opened.push({ close, dispose: () => test.runtime.dispose() });
    await settle();
    const input = root.querySelector("[data-testid=greeting-input]") as HTMLInputElement;
    input.value = "Moin";
    input.dispatchEvent(new Event("input"));
    await settle();
    test.store.holdSaves();
    root.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true }));
    await settle();
    expect(test.store.heldSaves()).toBe(1);
    const { save } = (instance as unknown as { setupState: { save: SaveRefs } }).setupState;

    close();
    test.store.releaseSaves();
    await settle();

    expect(test.store.stored()).toEqual(expect.objectContaining({ greeting: "Moin" }));
    const current = await test.runtime.runPromise(
      SettingsService.use((service) => service.current),
    );
    expect(encodeSettings(current)).toEqual(test.store.stored());
    expect({
      pending: save.pending.value,
      value: save.value.value,
      error: save.error.value,
      message: save.message.value,
    }).toEqual({ pending: true, value: undefined, error: undefined, message: undefined });
    expect(test.notifier.messages()).toEqual([]);
    expect(root.childElementCount).toBe(0);
  });
});
