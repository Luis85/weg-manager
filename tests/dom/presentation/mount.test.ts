import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, onMounted, ref } from "vue";
import { SCOPE_CLASS as SCRIPT_SCOPE_CLASS } from "../../../scripts/scope-css.mjs";
import { updateGreeting } from "../../../src/application/use-cases";
import { mountSurface } from "../../../src/presentation/mount";
import { PORTAL_CLASS, SCOPE_CLASS } from "../../../src/presentation/scope";
import { testRuntime } from "../../support/runtime";

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

const buttonNamed = (root: ParentNode, label: string): HTMLButtonElement => {
  const button = [...root.querySelectorAll("button")].find((el) => el.textContent.includes(label));
  if (button === undefined) throw new Error(`no button "${label}"`);
  return button;
};

afterEach(() => {
  for (const root of roots.splice(0)) root.remove();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe("mountSurface", () => {
  it("uses the same scope class as the CSS build", () => {
    expect(SCOPE_CLASS).toBe(SCRIPT_SCOPE_CLASS);
  });

  it("renders the panel inside a scoped root", async () => {
    const { runtime } = testRuntime({ store: { initial: { greeting: "Moin" } } });
    const root = newRoot();
    const close = mountSurface(root, runtime);
    await settle();
    expect(root.classList.contains(SCOPE_CLASS)).toBe(true);
    expect(root.querySelector(`:scope > .${PORTAL_CLASS}`)).not.toBeNull();
    expect(root.querySelector("[data-testid=greeting]")?.textContent).toContain("Moin");
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
    const close = mountSurface(root, runtime, { content: Probe });
    await settle();
    expect(seen).toEqual([{ connected: true, inRoot: true }]);
    close();
    await runtime.dispose();
  });

  it("closes once and leaves the root as it found it", async () => {
    const { runtime } = testRuntime();
    const root = newRoot();
    root.className = "host-class";
    const close = mountSurface(root, runtime);
    await settle();
    close();
    expect(root.children).toHaveLength(0);
    expect([...root.classList]).toEqual(["host-class"]);
    expect(() => close()).not.toThrow();
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
    const close = mountSurface(root, runtime, { content: Content });
    await settle();
    expect(notifier.messages()).toEqual([
      expect.objectContaining({ title: "Unerwarteter Fehler in WEG Manager" }),
    ]);
    expect(notifier.messages()[0]?.detail).toContain("T-1");
    expect(logger.entries().filter((entry) => entry.event === "defect.reported")).toHaveLength(1);
    close();
    await runtime.dispose();
  });

  it("adds nothing to document.head, also when the modal opens", async () => {
    const { runtime } = testRuntime();
    document.head.replaceChildren();
    const before = document.head.childElementCount;
    const root = newRoot();
    const close = mountSurface(root, runtime);
    await settle();
    expect(document.head.childElementCount).toBe(before);
    buttonNamed(root, "Über").click();
    await settle();
    expect(root.querySelector("[data-testid=about-body]")).not.toBeNull();
    expect(document.head.childElementCount).toBe(before);
    close();
    await runtime.dispose();
  });

  it("keeps a second surface working when the first closes (Review Focus 5)", async () => {
    const { runtime } = testRuntime();
    const first = newRoot();
    const second = newRoot();
    const closeFirst = mountSurface(first, runtime);
    const closeSecond = mountSurface(second, runtime);
    await settle();
    closeFirst();
    await runtime.runPromise(updateGreeting("Neu"));
    await settle();
    expect(first.children).toHaveLength(0);
    expect(second.querySelector("[data-testid=greeting]")?.textContent).toContain("Neu");
    closeSecond();
    await runtime.dispose();
  });

  it("keeps modal content inside a root in another document (Review Focus 4)", async () => {
    const { runtime } = testRuntime();
    const popout = document.implementation.createHTMLDocument("pop-out");
    const root = newRoot(popout);
    const mainChildren = document.body.childElementCount;
    const close = mountSurface(root, runtime);
    await settle();
    buttonNamed(root, "Über").click();
    await settle();
    const body = popout.querySelector("[data-testid=about-body]");
    expect(body).not.toBeNull();
    expect(root.contains(body)).toBe(true);
    expect(document.body.childElementCount).toBe(mainChildren);
    close();
    await runtime.dispose();
  });
});
