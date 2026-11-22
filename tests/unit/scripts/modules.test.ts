import { describe, expect, it } from "vitest";
import { CORE_MODULES, parseModuleNames, readModules } from "../../../scripts/modules.mjs";

const LIST = `import { communitiesModule } from "./communities";
import { notesModule } from "./notes";
import { shellModule } from "./shell";
import { pointsModule } from "./points";

export const APP_MODULES = [shellModule, notesModule, communitiesModule, pointsModule] as const;
`;

describe("parseModuleNames", () => {
  it("names the folder of each element of APP_MODULES, in the list's order", () => {
    expect(parseModuleNames(LIST)).toEqual(["shell", "notes", "communities", "points"]);
  });

  it("reads the list without `as const` too", () => {
    expect(parseModuleNames(LIST.replace(" as const", ""))).toEqual([
      "shell",
      "notes",
      "communities",
      "points",
    ]);
  });

  it("refuses an element that is not imported from a module folder", () => {
    expect(() =>
      parseModuleNames(LIST.replace('from "./points"', 'from "../points/module"')),
    ).toThrow("src/application/modules.ts: pointsModule is not imported from a module folder.");
    expect(() => parseModuleNames(LIST.replace("pointsModule] as", "{}] as"))).toThrow(
      "{} is not imported from a module folder.",
    );
  });

  it("refuses a file without the list", () => {
    expect(() => parseModuleNames(LIST.replace("APP_MODULES", "MODULES"))).toThrow(
      "src/application/modules.ts: APP_MODULES must be an array literal of module manifests.",
    );
    expect(() => parseModuleNames("export const APP_MODULES = modules;")).toThrow(
      "APP_MODULES must be an array literal",
    );
  });
});

describe("readModules", () => {
  it("splits the list into the core modules and the feature modules", () => {
    expect(readModules(LIST)).toEqual({
      all: ["shell", "notes", "communities", "points"],
      core: ["shell", "notes"],
      features: ["communities", "points"],
    });
  });

  it("refuses a list that does not start with the core modules in their order", () => {
    const swapped = LIST.replace("[shellModule, notesModule,", "[notesModule, shellModule,");
    expect(() => readModules(swapped)).toThrow(
      "src/application/modules.ts: APP_MODULES must start with the core modules shell, notes.",
    );
  });

  it("reads the repository's list", () => {
    const { core, features } = readModules();
    expect(core).toEqual(CORE_MODULES);
    expect(features).toContain("communities");
  });
});
