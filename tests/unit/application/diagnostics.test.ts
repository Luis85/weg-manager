import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { REDACTED, buildDiagnostics, redact } from "../../../src/application/diagnostics";
import { Logger, type RecordedLogEntry } from "../../../src/application/ports";
import { SettingsServiceLive } from "../../../src/application/settings-service";
import {
  inMemoryStore,
  recordingNotifier,
  testHostInfo,
  type StoreOptions,
} from "../../support/layers";

const loggerWith = (entries: readonly RecordedLogEntry[]) =>
  Layer.succeed(Logger)({ log: () => Effect.void, recent: Effect.succeed(entries) });

const report = (store: StoreOptions, entries: readonly RecordedLogEntry[]) =>
  buildDiagnostics.pipe(
    Effect.provide(
      Layer.mergeAll(
        SettingsServiceLive.pipe(
          Layer.provide(Layer.merge(inMemoryStore(store).layer, recordingNotifier().layer)),
        ),
        loggerWith(entries),
        testHostInfo,
      ),
    ),
  );

describe("buildDiagnostics", () => {
  it.effect("writes the exact report for writable settings without entries", () =>
    Effect.gen(function* () {
      assert.strictEqual(
        yield* report({}, []),
        [
          "WEG Manager – Diagnose",
          "Plugin-Version: 0.1.0",
          "Obsidian-API: 1.15.1",
          "Plattform: test",
          "Einstellungen beschreibbar: ja",
          "Hinweise zu Einstellungen: keine",
          "Protokollstufe: warn",
          "Letzte Protokolleinträge (0):",
        ].join("\n"),
      );
    }),
  );

  it.effect("names the read-only reason, every issue and formats each entry", () =>
    Effect.gen(function* () {
      const text = yield* report({ failLoad: true }, [
        { at: 0, level: "error", event: "defect.reported", incidentId: "AB12CD" },
        { at: 1000, level: "info", event: "plugin.loaded", context: { count: 2 } },
      ]);
      assert.include(text, "Einstellungen beschreibbar: nein (unreadable)");
      assert.include(
        text,
        [
          "Letzte Protokolleinträge (2):",
          "1970-01-01T00:00:00.000Z ERROR defect.reported (AB12CD)",
          '1970-01-01T00:00:01.000Z INFO plugin.loaded {"count":2}',
        ].join("\n"),
      );
    }),
  );

  it.effect("joins settings issues with spaces", () =>
    Effect.gen(function* () {
      const text = yield* report({ initial: { greeting: 7, logLevel: "laut" } }, []);
      assert.include(
        text,
        "Hinweise zu Einstellungen: Die Begrüßung muss 1 bis 200 Zeichen lang sein. Die Protokollstufe muss eine von error, warn, info, debug sein.",
      );
    }),
  );
});

describe("redact", () => {
  it("keeps a string of exactly 200 characters and redacts 201", () => {
    assert.strictEqual(redact("x".repeat(200)), "x".repeat(200));
    assert.strictEqual(redact("x".repeat(201)), REDACTED);
  });

  it("redacts every sensitive key, also inside arrays", () => {
    assert.deepStrictEqual(
      redact({
        items: [{ content: "a", body: "b", text: "c", path: "d", name: "e", size: 1 }],
        ok: true,
      }),
      {
        items: [
          {
            content: REDACTED,
            body: REDACTED,
            text: REDACTED,
            path: REDACTED,
            name: REDACTED,
            size: 1,
          },
        ],
        ok: true,
      },
    );
  });

  it("keeps an empty key and null untouched", () => {
    assert.deepStrictEqual(redact({ "": "v", nothing: null }), { "": "v", nothing: null });
  });
});
