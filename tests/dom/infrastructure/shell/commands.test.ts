import { Effect } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PluginCommand } from "../../../../src/application/shell";
import type { AppServices } from "../../../../src/application/app-services";
import { testRuntime } from "../../../support/runtime";
import { asObsidianPlugin } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, Plugin } = await import("@test/obsidian");
const { registerCommands } = await import("../../../../src/infrastructure/obsidian/shell/commands");

class Bare extends Plugin {}

type Labels = { readonly greet: string; readonly go: string };
type TestRoute = { readonly name: "item"; readonly id: number };

const LABELS: Labels = { greet: "Grüßen", go: "Gehen" };

const setup = (commands: readonly PluginCommand<Labels, TestRoute, AppServices>[]) => {
  const { plugin, registry } = createTestPlugin(Bare);
  const test = testRuntime();
  const opened: (TestRoute | undefined)[] = [];
  const open = (route?: TestRoute) => {
    opened.push(route);
    return Promise.resolve();
  };
  const register = () =>
    registerCommands(asObsidianPlugin(plugin), test.runtime, commands, LABELS, open);
  return { plugin, registry, opened, register, ...test };
};

const runtimes: { dispose(): Promise<void> }[] = [];
afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.dispose()));
});

describe("registerCommands", () => {
  it("adds each command with its id and label, and no hotkeys", () => {
    const ran: string[] = [];
    const test = setup([
      { id: "go", name: (labels) => labels.go, action: { _tag: "open" } },
      {
        id: "greet",
        name: (labels) => labels.greet,
        action: { _tag: "run", effect: Effect.sync(() => ran.push("greet")) },
      },
    ]);
    runtimes.push(test.runtime);
    test.register();
    expect([...test.registry.commands.values()].map(({ id, name }) => [id, name])).toEqual([
      ["go", "Gehen"],
      ["greet", "Grüßen"],
    ]);
    for (const command of test.registry.commands.values()) {
      expect(command.hotkeys).toBeUndefined();
    }
  });

  it("opens a command's route, or none, and runs a use case through the runtime", async () => {
    const ran: string[] = [];
    const test = setup([
      { id: "go", name: (labels) => labels.go, action: { _tag: "open" } },
      {
        id: "go-to-item",
        name: (labels) => labels.go,
        action: { _tag: "open", route: { name: "item", id: 7 } },
      },
      {
        id: "greet",
        name: (labels) => labels.greet,
        action: { _tag: "run", effect: Effect.sync(() => ran.push("greet")) },
      },
    ]);
    runtimes.push(test.runtime);
    test.register();
    await test.registry.runCommand("go");
    await test.registry.runCommand("go-to-item");
    await test.registry.runCommand("greet");
    expect(test.opened).toEqual([undefined, { name: "item", id: 7 }]);
    expect(ran).toEqual(["greet"]);
  });

  it("reports a use case that dies once and resolves", async () => {
    const test = setup([
      {
        id: "greet",
        name: (labels) => labels.greet,
        action: { _tag: "run", effect: Effect.die(new Error("boom")) },
      },
    ]);
    runtimes.push(test.runtime);
    test.register();
    await expect(test.registry.runCommand("greet")).resolves.toBeUndefined();
    expect(test.logger.entries().map((entry) => entry.event)).toEqual(["defect.reported"]);
  });

  it("removes every command it added when undone", () => {
    const test = setup([
      { id: "go", name: (labels) => labels.go, action: { _tag: "open" } },
      { id: "greet", name: (labels) => labels.greet, action: { _tag: "open" } },
    ]);
    runtimes.push(test.runtime);
    const remove = vi.spyOn(test.plugin, "removeCommand");
    const undo = test.register();
    undo();
    expect(remove.mock.calls).toEqual([["go"], ["greet"]]);
    expect(test.registry.commands.size).toBe(0);
  });

  it("removes the commands it added before one failed, and rethrows", () => {
    const test = setup([
      { id: "go", name: (labels) => labels.go, action: { _tag: "open" } },
      { id: "greet", name: (labels) => labels.greet, action: { _tag: "open" } },
    ]);
    runtimes.push(test.runtime);
    test.registry.failNextAddCommand({ after: 1 });
    expect(test.register).toThrow("addCommand failed");
    expect(test.registry.commands.size).toBe(0);
  });
});
