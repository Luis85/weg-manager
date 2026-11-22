// @ts-check
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

/** The repository root. */
const ROOT = fileURLToPath(new URL("..", import.meta.url));

/** The one module list: `APP_MODULES` in the application root (ADR 0006, amendment 22.11.2026). */
export const MODULE_LIST = "src/application/modules.ts";

/** The core modules in dependency order (ADR 0006); every other module is a feature module. */
export const CORE_MODULES = ["shell", "notes"];

/** @param {string} message */
const fail = (message) => {
  throw new Error(`${MODULE_LIST}: ${message}`);
};

/**
 * The imported names of `source` by the module folder they come from (`./notes` gives `notes`).
 * @param {ts.SourceFile} source
 */
const importedFolders = (source) =>
  new Map(
    source.statements.filter(ts.isImportDeclaration).flatMap((statement) => {
      const specifier = /** @type {ts.StringLiteral} */ (statement.moduleSpecifier).text;
      const folder = /^\.\/([a-z][a-z-]*)$/.exec(specifier)?.[1];
      const bindings = statement.importClause?.namedBindings;
      if (folder === undefined || bindings === undefined || !ts.isNamedImports(bindings)) return [];
      return bindings.elements.map((element) => /** @type {const} */ ([element.name.text, folder]));
    }),
  );

/**
 * The initializer of `APP_MODULES` without its `as const`.
 * @param {ts.SourceFile} source
 */
const moduleList = (source) => {
  const declaration = source.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find(({ name }) => ts.isIdentifier(name) && name.text === "APP_MODULES");
  const list = declaration?.initializer;
  return list !== undefined && ts.isAsExpression(list) ? list.expression : list;
};

/**
 * The module names of `APP_MODULES` in its order: the folder each element is imported from
 * (`import { notesModule } from "./notes"` gives `notes`). The file is parsed, not run, so ESLint
 * and the fallow generator read the list without loading the application.
 * @param {string} text the source of `MODULE_LIST`
 * @returns {string[]}
 */
export const parseModuleNames = (text) => {
  const source = ts.createSourceFile(MODULE_LIST, text, ts.ScriptTarget.Latest);
  const folders = importedFolders(source);
  const list = moduleList(source);
  if (list === undefined || !ts.isArrayLiteralExpression(list)) {
    return fail("APP_MODULES must be an array literal of module manifests.");
  }
  return list.elements.map((element) => {
    const folder = ts.isIdentifier(element) ? folders.get(element.text) : undefined;
    return folder ?? fail(`${element.getText(source)} is not imported from a module folder.`);
  });
};

/**
 * The modules, read from `MODULE_LIST`: the core modules, which must come first and in order,
 * and the feature modules after them.
 * @param {string} [text] the source of `MODULE_LIST`; the file in the repository by default
 */
export const readModules = (text = readFileSync(`${ROOT}${MODULE_LIST}`, "utf8")) => {
  const all = parseModuleNames(text);
  const core = all.slice(0, CORE_MODULES.length);
  if (core.join() !== CORE_MODULES.join()) {
    fail(`APP_MODULES must start with the core modules ${CORE_MODULES.join(", ")}.`);
  }
  return { all, core, features: all.slice(CORE_MODULES.length) };
};
