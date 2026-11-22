import { assert, describe, it } from "@effect/vitest";
import { Context, Effect, Layer, Schema } from "effect";
import {
  catalogOf,
  commandsOf,
  defineModule,
  describerOf,
  noteTypesOf,
  routeSchemasOf,
  sectionsOf,
  servicesLayerOf,
} from "../../../src/application/module";
import { communityType } from "../../../src/domain/communities";
import { testItem } from "../../support/notes/test-note-type";

// Two throwaway modules: `alpha` with every part, `beta` with only its texts, errors and a section.

class AlphaError extends Schema.TaggedError<AlphaError>()("AlphaError", {}) {}
class AlphaGone extends Schema.TaggedError<AlphaGone>()("AlphaGone", {}) {}
class BetaError extends Schema.TaggedError<BetaError>()("BetaError", { reason: Schema.String }) {}

class AlphaService extends Context.Service<AlphaService, { readonly value: number }>()(
  "test/AlphaService",
) {}

const alphaRoute = Schema.Struct({ name: Schema.Literal("alpha") });

const alpha = defineModule({
  name: "alpha",
  catalog: { de: { title: "Alpha de" }, en: { title: "Alpha en" } },
  errors: {
    tags: { AlphaError: true, AlphaGone: true },
    describe: (error: AlphaError | AlphaGone, messages: { readonly title: string }) => ({
      severity: "warning",
      title: messages.title,
      detail: error._tag,
    }),
  },
  noteTypes: [communityType],
  routes: [alphaRoute],
  sections: [{ id: "alpha-late", order: 900 }],
  services: Layer.succeed(AlphaService)({ value: 7 }),
  commands: [
    {
      id: "open-alpha",
      name: (messages) => messages.alpha.title,
      action: { _tag: "open", route: { name: "alpha" } },
    },
  ],
});

const beta = defineModule({
  name: "beta",
  catalog: { de: { label: "Beta de" }, en: { label: "Beta en" } },
  errors: {
    tags: { BetaError: true },
    describe: (error: BetaError, messages: { readonly label: string }) => ({
      severity: "error",
      title: messages.label,
      detail: error.reason,
    }),
  },
  noteTypes: [testItem],
  sections: [
    { id: "beta-early", order: 100 },
    { id: "beta-middle", order: 500 },
  ],
});

/** Neither texts of its own nor anything else: what the helpers must skip. */
const gamma = defineModule({ name: "gamma", catalog: { de: 1, en: 2 } });

const MODULES = [alpha, beta, gamma] as const;

/** A service the core modules build before every feature (the notes index, say). */
class CoreService extends Context.Service<CoreService, { readonly name: string }>()(
  "test/CoreService",
) {}
const coreLayer = Layer.succeed(CoreService)({ name: "core" });

/** A later feature's service built on an earlier feature's (`alpha`) and on the core's. */
class DeltaService extends Context.Service<DeltaService, { readonly value: string }>()(
  "test/DeltaService",
) {}
const delta = defineModule({
  name: "delta",
  catalog: { de: {}, en: {} },
  services: Layer.effect(DeltaService)(
    Effect.gen(function* () {
      const core = yield* CoreService;
      const earlier = yield* AlphaService;
      return { value: `${core.name} ${earlier.value}` };
    }),
  ),
});

describe("defineModule", () => {
  it("returns the manifest it is given", () => {
    const manifest = { name: "delta", catalog: { de: {}, en: {} } } as const;
    assert.strictEqual(defineModule(manifest), manifest);
  });
});

describe("catalogOf", () => {
  it("puts each module's part of the catalog under its name, in the language asked for", () => {
    assert.deepStrictEqual(catalogOf(MODULES, "de"), {
      alpha: { title: "Alpha de" },
      beta: { label: "Beta de" },
      gamma: 1,
    });
    assert.deepStrictEqual(catalogOf(MODULES, "en"), {
      alpha: { title: "Alpha en" },
      beta: { label: "Beta en" },
      gamma: 2,
    });
  });
});

describe("describerOf", () => {
  const describeAny = describerOf(MODULES);
  const german = catalogOf(MODULES, "de");

  it("hands each error to the module whose tags name it, with that module's texts", () => {
    assert.deepStrictEqual(describeAny(new AlphaGone(), german), {
      severity: "warning",
      title: "Alpha de",
      detail: "AlphaGone",
    });
    assert.deepStrictEqual(describeAny(new AlphaError(), catalogOf(MODULES, "en")), {
      severity: "warning",
      title: "Alpha en",
      detail: "AlphaError",
    });
    assert.deepStrictEqual(describeAny(new BetaError({ reason: "gone" }), german), {
      severity: "error",
      title: "Beta de",
      detail: "gone",
    });
  });
});

describe("the module parts", () => {
  it("joins the note types in module order", () => {
    assert.deepStrictEqual(noteTypesOf(MODULES), [communityType, testItem]);
  });

  it("orders the settings sections by their order, across the modules", () => {
    assert.deepStrictEqual(sectionsOf(MODULES), ["beta-early", "beta-middle", "alpha-late"]);
  });

  it("joins the route schemas and the commands in module order", () => {
    assert.deepStrictEqual(routeSchemasOf(MODULES), [alphaRoute]);
    assert.deepStrictEqual(
      commandsOf(MODULES).map((command) => command.id),
      ["open-alpha"],
    );
  });

  it.effect("folds the modules' service Layers onto the base, skipping one without services", () =>
    Effect.gen(function* () {
      const service = yield* AlphaService;
      assert.strictEqual(service.value, 7);
      assert.strictEqual((yield* CoreService).name, "core");
    }).pipe(Effect.provide(servicesLayerOf(MODULES, coreLayer))),
  );

  it.effect("gives a later module's services those of an earlier one and of the base", () =>
    Effect.gen(function* () {
      assert.strictEqual((yield* DeltaService).value, "core 7");
    }).pipe(Effect.provide(servicesLayerOf([alpha, gamma, delta], coreLayer))),
  );

  it("does not compile when a module needs a service of a later one", () => {
    // @ts-expect-error: `delta` needs `AlphaService`, which only the module after it builds.
    const reversed: Layer.Layer<DeltaService | AlphaService> = servicesLayerOf(
      [delta, alpha],
      coreLayer,
    );
    assert.isDefined(reversed);
  });

  it("adds nothing for modules without parts", () => {
    assert.deepStrictEqual(noteTypesOf([gamma]), []);
    assert.deepStrictEqual(sectionsOf([gamma]), []);
    assert.deepStrictEqual(routeSchemasOf([gamma]), []);
    assert.deepStrictEqual(commandsOf([gamma]), []);
  });
});
