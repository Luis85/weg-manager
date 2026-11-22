import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, onMounted, onUnmounted, ref, useId } from "vue";
import { SCOPE_CLASS as SCRIPT_SCOPE_CLASS } from "../../../../scripts/scope-css.mjs";
import { SettingsService } from "../../../../src/application/shell";
import { mountApp } from "../../../support/surface";
import { PORTAL_CLASS, SCOPE_CLASS } from "../../../../src/presentation/shell/scope";
import { testRuntime } from "../../../support/runtime";
import { eventually } from "../../../support/wait";

const roots: HTMLElement[] = [];
const newRoot = (doc: Document = document): HTMLElement => {
  const root = doc.createElement("div");
  doc.body.append(root);
  roots.push(root);
  return root;
};

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

/** Waits until the start route's screen, a lazily loaded component, shows `text`. */
const showing = (root: ParentNode, text: string) =>
  eventually(() => {
    expect(root.querySelector("[data-testid=communities-screen]")?.textContent).toContain(text);
  });

const buttonNamed = (root: ParentNode, label: string): HTMLButtonElement => {
  const button = [...root.querySelectorAll("button")].find((el) => el.textContent.includes(label));
  if (button === undefined) throw new Error(`no button "${label}"`);
  return button;
};

afterEach(() => {
  for (const root of roots.splice(0)) root.remove();
  document.body.className = "";
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("mountSurface", () => {
  it("uses the same scope class as the CSS build", () => {
    expect(SCOPE_CLASS).toBe(SCRIPT_SCOPE_CLASS);
  });

  it("renders the start screen inside a scoped root", async () => {
    const { runtime } = testRuntime({ store: { initial: { rootFolder: "Beirat" } } });
    const root = newRoot();
    const close = mountApp(root, runtime);
    await settle();
    expect(root.classList.contains(SCOPE_CLASS)).toBe(true);
    expect(root.querySelector(`:scope > .${PORTAL_CLASS}`)).not.toBeNull();
    await showing(root, "„Beirat/Gemeinschaften“");
    close();
    await runtime.dispose();
  });

  it("mounts the app into an element already attached to the root", async () => {
    const { runtime } = testRuntime();
    const seen: { connected: boolean; inRoot: boolean }[] = [];
    const root = newRoot();
    const Probe = defineComponent({
      setup() {
        const el = ref<HTMLElement>();
        onMounted(() => {
          seen.push({
            connected: el.value?.isConnected ?? false,
            inRoot: root.contains(el.value ?? null),
          });
        });
        return () => h("p", { ref: el }, "probe");
      },
    });
    const close = mountApp(root, runtime, { content: Probe });
    await settle();
    expect(seen).toEqual([{ connected: true, inRoot: true }]);
    close();
    await runtime.dispose();
  });

  it("closes once and leaves the root as it found it", async () => {
    const { runtime } = testRuntime();
    const root = newRoot();
    root.className = "host-class";
    const close = mountApp(root, runtime);
    await settle();
    close();
    expect(root.children).toHaveLength(0);
    expect([...root.classList]).toEqual(["host-class"]);
    expect(() => close()).not.toThrow();
    await runtime.dispose();
  });

  it("unmounts its Vue app when closed, so a component can clean up", async () => {
    const { runtime } = testRuntime();
    const unmounted = vi.fn<() => void>();
    const Probe = defineComponent({
      setup() {
        onUnmounted(unmounted);
        return () => h("p", "probe");
      },
    });
    const root = newRoot();
    const close = mountApp(root, runtime, { content: Probe });
    await settle();
    expect(unmounted).not.toHaveBeenCalled();
    close();
    expect(unmounted).toHaveBeenCalledTimes(1);
    close();
    expect(unmounted).toHaveBeenCalledTimes(1);
    await runtime.dispose();
  });

  it("keeps a scope class the root already had when it closes", async () => {
    const { runtime } = testRuntime();
    const root = newRoot();
    root.classList.add(SCOPE_CLASS);
    const close = mountApp(root, runtime);
    await settle();
    close();
    expect(root.classList.contains(SCOPE_CLASS)).toBe(true);
    await runtime.dispose();
  });

  it("does not undo a newer surface on the same root when an old one is closed again", async () => {
    const { runtime } = testRuntime();
    const root = newRoot();
    const closeOld = mountApp(root, runtime);
    await settle();
    closeOld();
    const closeNew = mountApp(root, runtime);
    await settle();
    closeOld();
    expect(root.classList.contains(SCOPE_CLASS)).toBe(true);
    expect(root.querySelector(`:scope > .${PORTAL_CLASS}`)).not.toBeNull();
    closeNew();
    expect(root.classList.contains(SCOPE_CLASS)).toBe(false);
    await runtime.dispose();
  });

  it("follows the host theme while open and gives the root back its classes on close", async () => {
    document.body.classList.add("theme-dark");
    const { runtime } = testRuntime();
    const root = newRoot();
    const close = mountApp(root, runtime);
    await settle();
    expect(root.classList.contains("dark")).toBe(true);
    close();
    expect(root.classList.contains("dark")).toBe(false);
    await runtime.dispose();
  });

  it("gives every surface in a document its own element ids", async () => {
    const { runtime } = testRuntime();
    const ids: string[] = [];
    const Probe = defineComponent({
      setup() {
        ids.push(useId());
        return () => h("p", "probe");
      },
    });
    const closes = [newRoot(), newRoot()].map((root) =>
      mountApp(root, runtime, { content: Probe }),
    );
    await settle();
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(id).toMatch(/^wm[0-9a-f]{8}--\d+$/);
    for (const close of closes) close();
    await runtime.dispose();
  });

  it("reports a throwing component once and keeps the rest of the surface", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { runtime, notifier, logger } = testRuntime();
    const Broken = defineComponent({
      render: () => {
        throw new Error("render exploded");
      },
    });
    const Content = defineComponent({
      render: () => h("div", [h("p", { "data-testid": "sibling" }, "still here"), h(Broken)]),
    });
    const root = newRoot();
    const close = mountApp(root, runtime, { content: Content });
    await settle();
    expect(notifier.messages()).toEqual([
      expect.objectContaining({ title: "Unerwarteter Fehler in WEG Manager" }),
    ]);
    expect(notifier.messages()[0]?.detail).toContain("T-1");
    expect(logger.entries().filter((entry) => entry.event === "defect.reported")).toHaveLength(1);
    close();
    await runtime.dispose();
  });

  it("adds nothing to document.head, also when a sheet opens", async () => {
    const { runtime, vaultReady } = testRuntime();
    document.head.replaceChildren();
    const before = document.head.childElementCount;
    const root = newRoot();
    const close = mountApp(root, runtime);
    await vaultReady();
    await showing(root, "Gemeinschaft anlegen");
    await settle();
    expect(document.head.childElementCount).toBe(before);
    buttonNamed(root, "Gemeinschaft anlegen").click();
    await settle();
    expect(root.querySelector("[data-testid=community-form]")).not.toBeNull();
    expect(document.head.childElementCount).toBe(before);
    close();
    await runtime.dispose();
  });

  it("keeps a second surface working when the first closes (Review Focus 5)", async () => {
    const { runtime } = testRuntime();
    const first = newRoot();
    const second = newRoot();
    const closeFirst = mountApp(first, runtime);
    const closeSecond = mountApp(second, runtime);
    await settle();
    await showing(second, "„WEG Manager/Gemeinschaften“");
    closeFirst();
    await runtime.runPromise(
      SettingsService.use((service) => service.update({ rootFolder: "Neu" })),
    );
    await settle();
    expect(first.children).toHaveLength(0);
    await showing(second, "„Neu/Gemeinschaften“");
    closeSecond();
    await runtime.dispose();
  });

  it("keeps modal content inside a root in another document (Review Focus 4)", async () => {
    const { runtime, vaultReady } = testRuntime();
    const popout = document.implementation.createHTMLDocument("pop-out");
    const root = newRoot(popout);
    const mainChildren = document.body.childElementCount;
    const close = mountApp(root, runtime);
    await vaultReady();
    await showing(root, "Gemeinschaft anlegen");
    await settle();
    buttonNamed(root, "Gemeinschaft anlegen").click();
    await settle();
    const body = popout.querySelector("[data-testid=community-form]");
    expect(body).not.toBeNull();
    expect(root.contains(body)).toBe(true);
    expect(document.body.childElementCount).toBe(mainChildren);
    close();
    await runtime.dispose();
  });
});
