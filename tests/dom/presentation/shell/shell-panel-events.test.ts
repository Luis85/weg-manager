import { flushPromises } from "@vue/test-utils";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import { EventBus } from "../../../../src/application/shell/event-bus";
import { AppEvent } from "../../../../src/application/events";
import { RECOUNT_DELAY_MS } from "../../../../src/presentation/shell/recount";
import { mountSurface } from "../../../../src/presentation/shell";
import { testRuntime } from "../../../support/runtime";

const settle = async (ms = 0) => {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, ms));
  await flushPromises();
};

const cleanups: (() => Promise<void>)[] = [];

const open = async (vault = 3) => {
  const test = testRuntime({ vault });
  const root = document.createElement("div");
  document.body.append(root);
  const close = mountSurface(root, test.runtime);
  cleanups.push(async () => {
    close();
    await test.runtime.dispose();
  });
  await settle();
  const publish = (...events: AppEvent[]) =>
    test.runtime.runPromise(
      EventBus.use((bus) => Effect.forEach(events, (event) => bus.publish(event))),
    );
  const count = () => root.querySelector("[data-testid=file-count]")?.textContent?.trim();
  return { ...test, root, publish, count };
};

afterEach(async () => {
  await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
  document.body.replaceChildren();
});

const created = (path: string, extension = "md") => AppEvent.FileCreated({ path, extension });

describe("ShellPanel and vault events", () => {
  it("recounts once after a burst of Markdown changes", async () => {
    const panel = await open(3);
    expect(panel.count()).toBe("3 Markdown-Dateien im Vault");
    panel.vault.set(5);
    await panel.publish(created("a.md"), created("b.md"));
    await settle(RECOUNT_DELAY_MS + 50);
    expect(panel.count()).toBe("5 Markdown-Dateien im Vault");
  });

  it("ignores changes that keep the set of Markdown files", async () => {
    const panel = await open(3);
    panel.vault.set(9);
    await panel.publish(
      created("bild.png", "png"),
      AppEvent.FileModified({ path: "a.md", extension: "md" }),
    );
    await settle(RECOUNT_DELAY_MS + 50);
    expect(panel.count()).toBe("3 Markdown-Dateien im Vault");
  });

  it("keeps the old count visible while recounting", async () => {
    const panel = await open(3);
    panel.vault.hold();
    panel.vault.set(4);
    await panel.publish(created("a.md"));
    await settle(RECOUNT_DELAY_MS + 50);
    expect(panel.vault.held()).toBe(1);
    expect(panel.count()).toBe("3 Markdown-Dateien im Vault");
    expect(panel.root.querySelector("[data-testid=file-count-pending]")).toBeNull();
    panel.vault.release();
    await settle();
    expect(panel.count()).toBe("4 Markdown-Dateien im Vault");
  });

  it("stops listening when the surface closes", async () => {
    const test = testRuntime({ vault: 3 });
    const root = document.createElement("div");
    document.body.append(root);
    const close = mountSurface(root, test.runtime);
    cleanups.push(() => test.runtime.dispose());
    await settle();
    close();
    test.vault.hold();
    await test.runtime.runPromise(EventBus.use((bus) => bus.publish(created("a.md"))));
    await settle(RECOUNT_DELAY_MS + 50);
    expect(test.vault.held()).toBe(0);
  });
});
