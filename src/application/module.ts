import { Layer, type Schema } from "effect";
import type { NoteTypeRegistry } from "./notes";
import type { Language, PluginCommand, RouteLike, UserMessage } from "./shell";

// The module manifest (ADR 0006, amendment 2026-11-22): what a module's application side adds to
// the app, as plain data. Each module writes one with `defineModule` in its `module.ts`; the
// application root lists them once (`APP_MODULES`, `modules.ts`) and derives every composed type
// and value from that list with the helpers below. This file imports no module at runtime.

type Tagged = { readonly _tag: string };

/** One key per member of an error union; typecheck fails while one is missing or extra. */
export type ErrorTags<Error extends Tagged> = { readonly [Tag in Error["_tag"]]: true };

/** A section a module adds to the settings screen: its id and its place in the screen's list. */
export type SectionEntry<Id extends string> = {
  readonly id: Id;
  /** Lower comes first in the screen's navigation. */
  readonly order: number;
};

/**
 * A module's application side. `name` is its folder name in every layer and the key of its part of
 * the `Catalog`. Every part a module has not is left out.
 */
export type ModuleManifest<
  Name extends string,
  Catalog,
  Error extends Tagged,
  Section extends string,
  Route extends RouteLike,
  Services,
  Requires,
  CommandRoute,
  CommandServices,
> = {
  readonly name: Name;
  /** Its part of the catalog, typed by the module, in both languages. */
  readonly catalog: { readonly de: Catalog; readonly en: Catalog };
  /** Its error union: one tag per member, and the text of each (`describeError` hands it here). */
  readonly errors?: {
    readonly tags: ErrorTags<Error>;
    readonly describe: (error: Error, messages: Catalog) => UserMessage;
  };
  /** The note types the index holds for it. */
  readonly noteTypes?: NoteTypeRegistry;
  /** The route schemas of its own screens; each joins `Route`. */
  readonly routes?: readonly Schema.Codec<Route>[];
  /** Its sections of the shell's settings screen. */
  readonly sections?: readonly SectionEntry<Section>[];
  /** The Layer of its application services, built on the services of `shell` and `notes`. */
  readonly services?: Layer.Layer<Services, never, Requires>;
  /** Its commands; the label reads its own part of the catalog. */
  readonly commands?: readonly PluginCommand<
    { readonly [K in Name]: Catalog },
    CommandRoute,
    CommandServices
  >[];
};

/**
 * A module manifest with its types inferred: the name, the catalog, the error union, the section
 * ids, the routes, the services and the commands. It returns `manifest` unchanged.
 */
export const defineModule = <
  const Name extends string,
  Catalog,
  Error extends Tagged = never,
  Section extends string = never,
  Route extends RouteLike = never,
  Services = never,
  Requires = never,
  CommandRoute = never,
  CommandServices = never,
>(
  manifest: ModuleManifest<
    Name,
    Catalog,
    Error,
    Section,
    Route,
    Services,
    Requires,
    CommandRoute,
    CommandServices
  >,
) => manifest;

/** Any manifest, whatever its types: what the helpers below read. */
type AnyModule = {
  readonly name: string;
  readonly catalog: { readonly de: unknown; readonly en: unknown };
  readonly errors?: {
    readonly tags: object;
    readonly describe: (error: never, messages: never) => UserMessage;
  };
  readonly noteTypes?: NoteTypeRegistry;
  readonly routes?: readonly Schema.Top[];
  readonly sections?: readonly SectionEntry<string>[];
  readonly services?: Layer.Layer<never, unknown, unknown>;
  readonly commands?: readonly unknown[];
};

/** The modules' parts of the catalog, by module name. */
export type CatalogOf<M extends AnyModule> = {
  readonly [Module in M as Module["name"]]: Module["catalog"]["de"];
};

/** The union of the modules' error unions. */
export type ErrorOf<M extends AnyModule> = Parameters<NonNullable<M["errors"]>["describe"]>[0];

/** The ids of the modules' settings sections. */
export type SectionOf<M extends AnyModule> = NonNullable<M["sections"]>[number]["id"];

/** The routes of the modules' own screens. */
export type RouteOf<M extends AnyModule> = NonNullable<M["routes"]>[number]["Type"];

/** The services the modules' Layers provide. */
export type ServicesOf<M extends AnyModule> = Layer.Success<NonNullable<M["services"]>>;

/** The catalog of `language`: each module's part under its name. */
export const catalogOf = <const M extends readonly AnyModule[]>(
  modules: M,
  language: Language,
): CatalogOf<M[number]> =>
  Object.fromEntries(modules.map((module) => [module.name, module.catalog[language]])) as CatalogOf<
    M[number]
  >;

/**
 * The text of an error of any module: the module whose tags name the error describes it with its
 * part of the catalog. Exhaustive by type: `ErrorOf` is the union of the describers' errors, and
 * each module's tags name every member of its union.
 */
export const describerOf = <const M extends readonly AnyModule[]>(modules: M) => {
  const describers = new Map(
    modules.flatMap(({ name, errors }) =>
      errors === undefined
        ? []
        : Object.keys(errors.tags).map(
            (tag) => [tag, { name, describe: errors.describe }] as const,
          ),
    ),
  );
  return (error: ErrorOf<M[number]>, messages: CatalogOf<M[number]>): UserMessage => {
    // Defined for every tag `ErrorOf` admits; the cast only drops the link between the two types.
    const { name, describe } = describers.get((error as Tagged)._tag) as {
      readonly name: keyof typeof messages;
      readonly describe: (error: unknown, messages: unknown) => UserMessage;
    };
    return describe(error, messages[name]);
  };
};

/** Every module's note types, in module order. */
export const noteTypesOf = (modules: readonly AnyModule[]): NoteTypeRegistry =>
  modules.flatMap((module) => module.noteTypes ?? []);

/** Every module's settings sections, by `order`. */
export const sectionsOf = <const M extends readonly AnyModule[]>(
  modules: M,
): readonly SectionOf<M[number]>[] =>
  modules
    .flatMap((module) => module.sections ?? [])
    .toSorted((a, b) => a.order - b.order)
    .map((section) => section.id);

/** Every module's route schemas, in module order. */
export const routeSchemasOf = <const M extends readonly AnyModule[]>(modules: M) =>
  modules.flatMap((module) => module.routes ?? []) as unknown as readonly Schema.Codec<
    RouteOf<M[number]>
  >[];

/** Every module's commands, in module order. */
export const commandsOf = <const M extends readonly AnyModule[]>(modules: M) =>
  modules.flatMap((module) => module.commands ?? []) as readonly NonNullable<
    M[number]["commands"]
  >[number][];

/**
 * The modules' service Layers merged into one; a module without services adds nothing. It needs
 * what the Layers need: `appServicesLayer` builds it on the core modules' services.
 */
export const servicesLayerOf = <const M extends readonly AnyModule[]>(modules: M) =>
  Layer.mergeAll(
    Layer.empty,
    ...(modules.flatMap((module) =>
      module.services === undefined ? [] : [module.services],
    ) as Layer.Layer<never>[]),
  ) as unknown as Layer.Layer<
    ServicesOf<M[number]>,
    Layer.Error<NonNullable<M[number]["services"]>>,
    Layer.Services<NonNullable<M[number]["services"]>>
  >;
