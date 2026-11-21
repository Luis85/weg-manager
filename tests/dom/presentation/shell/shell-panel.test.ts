import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GREETING_MAX_LENGTH } from "../../../../src/domain/shell/settings";
import { validatePatch, DEFAULT_SETTINGS } from "../../../../src/domain/shell/settings";
import { ReadOnlySettingsError } from "../../../../src/application/shell/errors";
import { de } from "../../../../src/application/messages";
import { describeIssue } from "../../../../src/application/shell/i18n/describe";
import { describeError } from "../../../../src/application/user-messages";
import { mountApp } from "../../../support/surface";
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
  const close = mountApp(root, test.runtime);
  opened.push({ close, dispose: () => test.runtime.dispose() });
  await settle();
  const q = (id: string) => root.querySelector(`[data-testid=${id}]`);
  const input = () => q("greeting-input") as HTMLInputElement;
  const submit = () => root.querySelector("button[type=submit]") as HTMLButtonElement;
  const type = async (value: string) => {
    input().value = value;
    input().dispatchEvent(new Event("input"));
    await settle();
  };
  const save = async () => {
    root.querySelector("form")?.dispatchEvent(new Event("submit", { cancelable: true }));
    await settle();
  };
  return { ...test, root, close, q, input, submit, type, save };
};

afterEach(async () => {
  const surfaces = opened.splice(0);
  for (const { close } of surfaces) close();
  await Promise.all(surfaces.map(({ dispose }) => dispose()));
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

const issueFor = (greeting: string) => {
  const result = validatePatch(DEFAULT_SETTINGS, { greeting });
  const issue = result.ok ? undefined : result.issues[0];
  if (issue === undefined) throw new Error("expected an issue");
  return describeIssue(issue, de.shell);
};

describe("ShellPanel", () => {
  it("shows a skeleton, then the markdown file count", async () => {
    const test = testRuntime({ vault: 7 });
    test.vault.hold();
    const root = document.createElement("div");
    document.body.append(root);
    const close = mountApp(root, test.runtime);
    opened.push({ close, dispose: () => test.runtime.dispose() });
    await settle();
    expect(root.querySelector("[data-testid=file-count-pending]")).not.toBeNull();
    test.vault.release();
    await settle();
    expect(root.querySelector("[data-testid=file-count]")?.textContent).toContain("7");
  });

  it("uses the singular for exactly one file", async () => {
    const panel = await open({ vault: 1 });
    expect(panel.q("file-count")?.textContent.trim()).toBe("1 Markdown-Datei im Vault");
  });

  it.each([0, 3])("uses the plural for %i files", async (files) => {
    const panel = await open({ vault: files });
    expect(panel.q("file-count")?.textContent.trim()).toBe(`${files} Markdown-Dateien im Vault`);
  });

  it("marks the count region busy for screen readers, then announces the result politely", async () => {
    const test = testRuntime({ vault: 7 });
    test.vault.hold();
    const root = document.createElement("div");
    document.body.append(root);
    const close = mountApp(root, test.runtime);
    opened.push({ close, dispose: () => test.runtime.dispose() });
    await settle();
    const region = () => root.querySelector("[data-testid=file-count-region]");
    expect(region()?.getAttribute("aria-live")).toBe("polite");
    expect(region()?.getAttribute("aria-busy")).toBe("true");
    const status = region()?.querySelector(".wm\\:sr-only");
    expect(status?.textContent.trim()).toBe("Zähle Notizen …");
    test.vault.release();
    await settle();
    expect(region()?.getAttribute("aria-busy")).not.toBe("true");
    expect(region()?.getAttribute("aria-live")).toBe("polite");
    expect(region()?.querySelector("[data-testid=file-count]")?.textContent).toContain("7");
    expect(region()?.textContent).not.toContain("Zähle Notizen");
  });

  it("shows the vault error with a retry that succeeds once the vault recovers", async () => {
    const panel = await open({ vault: "fail" });
    const alert = panel.root.querySelector("[role=alert]");
    expect(alert?.textContent).toContain("Notizen nicht lesbar");
    panel.vault.set(5);
    const retry = [...(alert?.querySelectorAll("button") ?? [])].find((button) =>
      button.textContent.includes("Erneut versuchen"),
    );
    retry?.click();
    await settle();
    expect(panel.root.querySelector("[role=alert]")).toBeNull();
    expect(panel.q("file-count")?.textContent).toContain("5");
  });

  it("blocks an empty greeting with the domain's issue and saves nothing", async () => {
    const panel = await open();
    await panel.type("   ");
    expect(panel.root.textContent).toContain(issueFor("   "));
    expect(panel.submit().disabled).toBe(true);
    await panel.save();
    expect(panel.store.saved()).toEqual([]);
  });

  it("shows the domain's issue for an over-long greeting", async () => {
    const panel = await open();
    const long = "x".repeat(GREETING_MAX_LENGTH + 1);
    await panel.type(long);
    expect(panel.root.textContent).toContain(issueFor(long));
    expect(panel.submit().disabled).toBe(true);
  });

  it("puts a service-side rejection under the field", async () => {
    const panel = await open({ rejectUpdates: [{ code: "greeting.length", max: 3 }] });
    await panel.type("Moin");
    await panel.save();
    expect(panel.root.querySelector("form")?.textContent).toContain(
      "Die Begrüßung muss 1 bis 3 Zeichen lang sein.",
    );
    expect(panel.root.querySelector("form [role=alert]")).toBeNull();
  });

  it("disables the button while saving and shows the new greeting after", async () => {
    const panel = await open();
    panel.store.holdSaves();
    await panel.type("Moin Moin");
    await panel.save();
    expect(panel.submit().disabled).toBe(true);
    panel.store.releaseSaves();
    await settle();
    expect(panel.q("greeting")?.textContent).toContain("Moin Moin");
    expect(panel.store.saved()).toEqual([expect.objectContaining({ greeting: "Moin Moin" })]);
    expect(panel.submit().disabled).toBe(false);
  });

  it("shows a storage failure as a notice with retry", async () => {
    const panel = await open({ store: { failSave: true } });
    await panel.type("Moin");
    await panel.save();
    expect(panel.root.querySelector("form [role=alert]")?.textContent).toContain(
      "Einstellungen nicht gespeichert",
    );
    panel.store.setFailSave(false);
    const retry = [...panel.root.querySelectorAll("form [role=alert] button")].find((button) =>
      button.textContent.includes("Erneut versuchen"),
    ) as HTMLButtonElement | undefined;
    retry?.click();
    await settle();
    expect(panel.store.saved()).toEqual([expect.objectContaining({ greeting: "Moin" })]);
  });

  it.each([
    ["an unreadable store", { failLoad: true }, "unreadable"],
    ["settings from a newer version", { initial: { schemaVersion: 99 } }, "newer-version"],
  ] as const)(
    "shows the read-only cause and action and disables saving for %s",
    async (_, store, reason) => {
      const panel = await open({ store });
      const hint = panel.q("read-only-hint");
      const expected = describeError(new ReadOnlySettingsError({ reason }), de);
      expect(hint?.getAttribute("role")).toBe("alert");
      expect(hint?.textContent).toContain(expected.title);
      expect(hint?.textContent).toContain(expected.detail);
      expect(hint?.textContent).toContain("Diagnose kopieren");
      expect(panel.submit().disabled).toBe(true);
      expect(panel.input().disabled).toBe(true);
    },
  );

  it("writes no state and warns nothing when unmounted during a pending count", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const test = testRuntime({ vault: 4 });
    test.vault.hold();
    const root = document.createElement("div");
    document.body.append(root);
    const close = mountApp(root, test.runtime);
    await settle();
    expect(test.vault.held()).toBe(1);
    close();
    test.vault.release();
    await settle();
    expect(warn).not.toHaveBeenCalled();
    expect(test.notifier.messages()).toEqual([]);
    expect(root.children).toHaveLength(0);
    await test.runtime.dispose();
  });
});
