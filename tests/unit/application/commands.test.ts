import { assert, describe, it } from "@effect/vitest";
import { appCommands } from "../../../src/application/commands";
import { de, en } from "../../../src/application/messages";
import { copyDiagnostics } from "../../../src/application/shell";

/** The plugin id from `manifest.json`; Obsidian prefixes every command id with it. */
const PLUGIN_ID = "weg-manager";

describe("appCommands", () => {
  it("holds the shell's commands: open the view, copy the diagnostics", () => {
    assert.deepStrictEqual(
      appCommands.map((command) => [command.id, command.name(de), command.name(en)]),
      [
        ["open-view", "Ansicht öffnen", "Open view"],
        ["copy-diagnostics", "Diagnose kopieren", "Copy diagnostics"],
      ],
    );
  });

  it("opens the view on its own route and runs the diagnostics use case", () => {
    const [open, copy] = appCommands;
    assert.deepStrictEqual(open?.action, { _tag: "open" });
    assert.deepStrictEqual(copy?.action, { _tag: "run", effect: copyDiagnostics });
  });

  it("uses each id once, in kebab-case and without the plugin id, which Obsidian adds", () => {
    const ids = appCommands.map((command) => command.id);
    assert.strictEqual(new Set(ids).size, ids.length);
    for (const id of ids) {
      assert.match(id, /^[a-z]+(-[a-z]+)*$/);
      assert.notInclude(id, PLUGIN_ID);
    }
  });

  it("has a label in both languages for every command", () => {
    for (const command of appCommands) {
      assert.isNotEmpty(command.name(de).trim());
      assert.isNotEmpty(command.name(en).trim());
    }
  });
});
