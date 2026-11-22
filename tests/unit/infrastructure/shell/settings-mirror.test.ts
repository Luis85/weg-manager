import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppRuntime } from "../../../../src/application/app-services";
import { SettingsService } from "../../../../src/application/shell";
import { mirrorSettings } from "../../../../src/infrastructure/obsidian/shell/settings-mirror";
import { testRuntime } from "../../../support/runtime";

const runtimes: AppRuntime[] = [];
const make = (initial?: unknown) => {
  const test = testRuntime(initial === undefined ? {} : { store: { initial } });
  runtimes.push(test.runtime);
  const update = (patch: { rootFolder?: string; logLevel?: "debug" }) =>
    test.runtime.runPromise(SettingsService.use((service) => service.update(patch)));
  const reload = () => test.runtime.runPromise(SettingsService.use((service) => service.reload));
  return { ...test, update, reload };
};

/** Lets the mirror's forked stream readers subscribe before a test changes anything. */
const subscribed = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.dispose()));
});

describe("mirrorSettings", () => {
  it("starts from the settings and the status the service holds", async () => {
    const { runtime } = make({ logLevel: "info" });
    const mirror = await mirrorSettings(runtime);
    expect(mirror.settings().logLevel).toBe("info");
    expect(mirror.status()).toEqual({ writable: true, issues: [] });
    await mirror.stop();
  });

  it("follows a settings change and keeps the status", async () => {
    const { runtime, update } = make();
    const mirror = await mirrorSettings(runtime);
    const status = mirror.status();
    await subscribed();
    await update({ rootFolder: "Beirat" });
    await vi.waitFor(() => expect(mirror.settings().rootFolder).toBe("Beirat"));
    expect(mirror.status()).toEqual(status);
    await mirror.stop();
  });

  it("follows a status change and keeps the settings", async () => {
    const { runtime, store, reload } = make();
    const mirror = await mirrorSettings(runtime);
    const settings = mirror.settings();
    await subscribed();
    store.writeExternally({ schemaVersion: 2 });
    await reload();
    await vi.waitFor(() => expect(mirror.status().writable).toBe(false));
    expect(mirror.status().readOnlyReason).toBeDefined();
    expect(mirror.settings()).toEqual(settings);
    await mirror.stop();
  });

  it("reads the service's current state on refresh, even when it is not following", async () => {
    const { runtime, update } = make();
    const mirror = await mirrorSettings(runtime);
    await mirror.stop();
    await update({ rootFolder: "Neu" });
    expect(mirror.settings().rootFolder).not.toBe("Neu");
    await mirror.refresh();
    expect(mirror.settings().rootFolder).toBe("Neu");
  });

  it("stops following settings and status after stop, while another mirror still does", async () => {
    const { runtime, store, update, reload } = make({ logLevel: "info" });
    const stopped = await mirrorSettings(runtime);
    const following = await mirrorSettings(runtime);
    await subscribed();
    await stopped.stop();
    await update({ rootFolder: "Später" });
    await vi.waitFor(() => expect(following.settings().rootFolder).toBe("Später"));
    store.writeExternally({ schemaVersion: 2 });
    await reload();
    await vi.waitFor(() => expect(following.status().writable).toBe(false));
    expect(stopped.settings().rootFolder).not.toBe("Später");
    expect(stopped.status().writable).toBe(true);
    await following.stop();
  });

  it("can be stopped twice", async () => {
    const { runtime } = make();
    const mirror = await mirrorSettings(runtime);
    await mirror.stop();
    await expect(mirror.stop()).resolves.toBeUndefined();
  });
});
