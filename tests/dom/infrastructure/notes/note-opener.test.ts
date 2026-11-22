import { vi } from "vitest";
import { noteOpenerLayer } from "../../../../src/infrastructure/obsidian/notes";
import { App } from "../../../support/obsidian";
import { noteOpenerContract } from "../../../support/notes/contract-opener";

vi.mock("obsidian", () => import("@test/obsidian"));

noteOpenerContract("Obsidian adapter on the double", () => {
  const app = new App();
  return {
    layer: noteOpenerLayer(app as never),
    seed: async (path) => {
      app.vault.seedFile(path, "");
    },
    // Each note in a new tab (`getLeaf("tab")`), made the active one, never in the plugin's tab;
    // anything else shows up next to the path, so the contract's comparison fails on it.
    opened: () =>
      app.workspace.leaves.flatMap((leaf, index) =>
        leaf.openedFiles.map(({ path, state }) => {
          const how = JSON.stringify([app.workspace.leafRequests[index], state]);
          return how === JSON.stringify(["tab", { active: true }]) ? path : `${path} ${how}`;
        }),
      ),
  };
});
