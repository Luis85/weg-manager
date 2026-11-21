import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { mountSurface } from "../../../../src/presentation/shell/mount";
import { testRuntime } from "../../../support/runtime";

const settle = async () => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await flushPromises();
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("AboutDialog", () => {
  it("labels Nuxt UI's built-in close button in German", async () => {
    const { runtime } = testRuntime();
    const root = document.createElement("div");
    document.body.append(root);
    const close = mountSurface(root, runtime);
    await settle();
    const open = [...root.querySelectorAll("button")].find((button) =>
      button.textContent.includes("Über"),
    );
    open?.click();
    await settle();
    const dialog = root.querySelector("[role=dialog]");
    expect(dialog?.querySelector("[data-testid=about-body]")).not.toBeNull();
    const labels = [...(dialog?.querySelectorAll("button") ?? [])].map((button) =>
      button.getAttribute("aria-label"),
    );
    expect(labels).toContain("Schließen");
    expect(labels).not.toContain("Close");
    close();
    await runtime.dispose();
  });
});
