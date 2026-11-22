import { assert, describe, it } from "@effect/vitest";
import { Effect, Exit, Layer, Option, Stream } from "effect";
import { TestClock } from "effect/testing";
import { appServicesLayer } from "../../../src/application/app-services-layer";
import { AppEvent } from "../../../src/application/events";
import { NoteStore, noteChanges, noteSnapshot } from "../../../src/application/notes";
import { INDEX_BATCH_QUIET } from "../../../src/application/notes/index-batches";
import { EventBus, Logger, Messages } from "../../../src/application/shell";
import { communityType } from "../../../src/domain/communities";
import { testAdapters } from "../../support/adapters";
import { FULL, testItem } from "../../support/notes/test-note-type";

/** What the host event adapter publishes once Obsidian's cache holds every note. */
const readyAtBuild = Layer.effectDiscard(
  EventBus.use((bus) =>
    Effect.andThen(bus.publish(AppEvent.LayoutReady()), bus.publish(AppEvent.VaultReady())),
  ),
);

const AHORNWEG = {
  schema: "weg-manager.community/v1",
  id: "community-00000000-0000-4000-8000-000000000001",
  name: "Ahornweg 12",
  short_code: "AW",
  color: "teal",
  kind: "WEG",
  unit_label: "Einheiten",
};

const ITEM = { ...FULL, id: "test-item-00000000-0000-4000-8000-000000000001", title: "Dach" };

/** The first snapshot of `type` that is ready. */
const readySnapshot = (type: typeof communityType | typeof testItem) =>
  Effect.map(
    Stream.runHead(
      Stream.filter(noteChanges(type as typeof testItem), (snapshot) => snapshot.ready),
    ),
    Option.getOrThrow,
  );

const communityTypeChanges = noteChanges(communityType);

/** The services over fresh in-memory adapters, in `language`. */
const inLanguage = (language: "de" | "en") =>
  appServicesLayer(testAdapters().adapters, { language, developmentMode: false });

describe("appServicesLayer", () => {
  it.effect("builds the host event adapter last, so the index sees VaultReady and builds", () => {
    const test = testAdapters({ hostEvents: readyAtBuild });
    test.notes.seed("WEG Manager/Gemeinschaften/Ahornweg 12.md", AHORNWEG);
    return Effect.gen(function* () {
      const snapshot = yield* readySnapshot(communityType);
      assert.deepStrictEqual(
        snapshot.notes.map((note) => note.path),
        ["WEG Manager/Gemeinschaften/Ahornweg 12.md"],
      );
    }).pipe(
      Effect.provide(appServicesLayer(test.adapters, { language: "de", developmentMode: false })),
    );
  });

  it.effect("builds the note store on the event bus, so the index follows its writes", () => {
    const test = testAdapters({ hostEvents: readyAtBuild });
    return Effect.gen(function* () {
      yield* readySnapshot(communityType);
      yield* NoteStore.use((store) =>
        store.create({ folder: "WEG Manager", name: "Ahornweg 12", frontmatter: AHORNWEG }),
      );
      yield* TestClock.adjust(INDEX_BATCH_QUIET);
      const snapshot = yield* Stream.runHead(
        Stream.filter(communityTypeChanges, (next) => next.notes.length === 1),
      );
      assert.isTrue(Option.isSome(snapshot));
    }).pipe(
      Effect.provide(appServicesLayer(test.adapters, { language: "de", developmentMode: false })),
    );
  });

  it.effect("indexes the plugin's note types unless it is given others", () => {
    const own = testAdapters({ hostEvents: readyAtBuild });
    const given = testAdapters({ hostEvents: readyAtBuild });
    given.notes.seed("Notizen/Dach.md", ITEM);
    return Effect.gen(function* () {
      const plugin = yield* Effect.exit(
        noteSnapshot(testItem).pipe(
          Effect.provide(
            appServicesLayer(own.adapters, { language: "de", developmentMode: false }),
          ),
        ),
      );
      assert.isTrue(Exit.hasDies(plugin));
      const tests = yield* readySnapshot(testItem).pipe(
        Effect.provide(
          appServicesLayer(given.adapters, {
            language: "de",
            developmentMode: false,
            noteTypes: [communityType, testItem],
          }),
        ),
      );
      assert.deepStrictEqual(
        tests.notes.map((note) => note.path),
        ["Notizen/Dach.md"],
      );
    });
  });

  it.effect("holds the catalog of the language it is given", () => {
    const openView = Messages.useSync((catalog) => catalog.shell.commands.openView);
    return Effect.gen(function* () {
      const german = yield* openView.pipe(Effect.provide(inLanguage("de")));
      const english = yield* openView.pipe(Effect.provide(inLanguage("en")));
      assert.strictEqual(german, "Ansicht öffnen");
      assert.strictEqual(english, "Open view");
    });
  });

  it.effect("writes every level to the log sink in development mode, else from the setting", () => {
    const production = testAdapters();
    const development = testAdapters();
    const debugAndWarn = Logger.use((logger) =>
      Effect.andThen(
        logger.log({ level: "debug", event: "test.debug" }),
        logger.log({ level: "warn", event: "test.warn" }),
      ),
    );
    return Effect.gen(function* () {
      yield* debugAndWarn.pipe(
        Effect.provide(
          appServicesLayer(production.adapters, { language: "de", developmentMode: false }),
        ),
      );
      yield* debugAndWarn.pipe(
        Effect.provide(
          appServicesLayer(development.adapters, { language: "de", developmentMode: true }),
        ),
      );
      assert.deepStrictEqual(
        production.logger.entries().map((entry) => entry.event),
        ["test.warn"],
      );
      assert.deepStrictEqual(
        development.logger.entries().map((entry) => entry.event),
        ["test.debug", "test.warn"],
      );
    });
  });
});
