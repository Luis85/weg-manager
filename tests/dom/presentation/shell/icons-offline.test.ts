import UIcon from "@nuxt/ui/components/Icon.vue";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { mountApp } from "../../../support/surface";
import { testRuntime } from "../../../support/runtime";

/**
 * Iconify reads `fetch` once, when its module loads, so the spy has to be in place before the
 * imports above run (vi.hoisted runs first). Any request it makes goes through this spy.
 */
const requests = vi.hoisted(() => {
  const urls: string[] = [];
  globalThis.fetch = (input) => {
    urls.push(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    return Promise.reject(new Error("no network in tests"));
  };
  return urls;
});

const roots: HTMLElement[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) root.remove();
  document.body.replaceChildren();
});

const mountIcons = async (names: string[]) => {
  const { runtime } = testRuntime();
  const root = document.createElement("div");
  document.body.append(root);
  roots.push(root);
  const close = mountApp(root, runtime, {
    content: {
      render: () =>
        h(
          "div",
          names.map((name) => h(UIcon, { name })),
        ),
    },
  });
  await flushPromises();
  return {
    root,
    done: async () => {
      close();
      await runtime.dispose();
    },
  };
};

describe("icons without network", () => {
  it("draws a bundled icon from the bundle", async () => {
    const { root, done } = await mountIcons(["i-lucide-plus"]);
    await vi.waitFor(() => expect(root.querySelector("svg")?.innerHTML).not.toBe(""));
    expect(requests).toEqual([]);
    await done();
  });

  it("requests nothing for an icon missing from SHELL_ICONS", async () => {
    const { root, done } = await mountIcons(["i-lucide-not-in-the-bundle", "i-mdi-other-set"]);
    // Iconify batches queries with a timer; give it more than one turn to send.
    await new Promise((resolve) => setTimeout(resolve, 50));
    await flushPromises();
    expect(requests).toEqual([]);
    // Iconify leaves an empty placeholder: no drawing, no request.
    expect([...root.querySelectorAll("svg")].map((svg) => svg.innerHTML)).toEqual(["", ""]);
    await done();
  });
});
