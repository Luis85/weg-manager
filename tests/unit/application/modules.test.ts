import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, expectTypeOf, it } from "vitest";
import { readModules } from "../../../scripts/modules.mjs";
import type { AppServices } from "../../../src/application/app-services";
import type { CommunitySelectionService } from "../../../src/application/communities";
import type { CommunitiesCatalog } from "../../../src/application/communities/i18n/catalog";
import type { InvalidCommunityError } from "../../../src/application/communities/errors";
import type { AppError } from "../../../src/application/errors";
import type { Catalog } from "../../../src/application/messages";
import { APP_MODULES, type AppModuleName } from "../../../src/application/modules";
import type { NoteIndex, NoteNotFoundError } from "../../../src/application/notes";
import type { Route, SettingsSection } from "../../../src/application/routes";
import type { SettingsService, StorageError } from "../../../src/application/shell";

const SRC = fileURLToPath(new URL("../../../src/", import.meta.url));

/** Where a module may have a folder: one per layer, and the in-memory adapters. */
const LAYERS = [
  "domain",
  "application",
  "infrastructure/obsidian",
  "infrastructure/memory",
  "presentation",
];

const foldersIn = (layer: string): string[] =>
  readdirSync(`${SRC}${layer}`, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const names: readonly string[] = APP_MODULES.map((module) => module.name);

/** The module list (`APP_MODULES`) against the folders on disk and the manifests (ADR 0006). */
describe("APP_MODULES", () => {
  it("names every module folder of every layer", () => {
    const folders = LAYERS.flatMap((layer) => foldersIn(layer).map((folder) => [layer, folder]));
    expect(folders.filter(([, folder]) => !names.includes(folder ?? ""))).toEqual([]);
  });

  it("has an application folder and a presentation folder with its screens for each module", () => {
    const missing = names.flatMap((name) =>
      [`application/${name}/module.ts`, `presentation/${name}/screens.ts`].filter(
        (file) => !existsSync(`${SRC}${file}`),
      ),
    );
    expect(missing).toEqual([]);
  });

  it("is the list ESLint and fallow read: each manifest from its own folder, once", () => {
    expect(readModules().all).toEqual(names);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives each error tag and each settings section to one module", () => {
    const tags = APP_MODULES.flatMap((module) => Object.keys(module.errors?.tags ?? {}));
    expect(new Set(tags).size).toBe(tags.length);
    const sections = APP_MODULES.flatMap((module) =>
      "sections" in module ? module.sections.map((section) => section.id) : [],
    );
    expect(new Set(sections).size).toBe(sections.length);
  });

  it("derives the composed types from the manifests without widening them", () => {
    expectTypeOf<keyof Catalog>().toEqualTypeOf<AppModuleName>();
    expectTypeOf<Catalog["communities"]>().toEqualTypeOf<CommunitiesCatalog>();
    expectTypeOf<InvalidCommunityError>().toExtend<AppError>();
    expectTypeOf<NoteNotFoundError | StorageError>().toExtend<AppError>();
    expectTypeOf<string>().not.toExtend<AppError["_tag"]>();
    expectTypeOf<{
      readonly name: "settings";
      readonly section: "communities";
    }>().toExtend<Route>();
    expectTypeOf<string>().not.toExtend<Route["name"]>();
    expectTypeOf<string>().not.toExtend<SettingsSection>();
    expectTypeOf<CommunitySelectionService | NoteIndex | SettingsService>().toExtend<AppServices>();
    expectTypeOf<unknown>().not.toExtend<AppServices>();
  });
});
