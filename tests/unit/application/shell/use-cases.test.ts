import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { buildDiagnostics } from "../../../../src/application/shell/diagnostics";
import { messagesLayer } from "../../../../src/application/messages";
import type { Language } from "../../../../src/application/shell/i18n/catalog";
import { Logger } from "../../../../src/application/shell/ports";
import { SettingsServiceLive } from "../../../../src/application/shell/settings-service";
import { copyDiagnostics, setLogLevel } from "../../../../src/application/shell/use-cases";
import {
  inMemoryStore,
  recordingClipboard,
  recordingLogger,
  recordingNotifier,
  testHostInfo,
  type StoreOptions,
} from "../../../support/layers";

const settingsWith = (options: StoreOptions = {}, language: Language = "de") => {
  const notifier = recordingNotifier();
  const store = inMemoryStore(options);
  const layer = SettingsServiceLive.pipe(
    Layer.provideMerge(Layer.mergeAll(store.layer, notifier.layer, messagesLayer(language))),
  );
  return { notifier, store, layer };
};

describe("setLogLevel", () => {
  it.effect("updates the log level", () =>
    Effect.gen(function* () {
      assert.strictEqual((yield* setLogLevel("debug")).logLevel, "debug");
    }).pipe(Effect.provide(settingsWith().layer)),
  );

  it.effect("fails with InvalidSettingsError for a level that does not exist", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(setLogLevel("loud" as never));
      assert.strictEqual(error._tag, "InvalidSettingsError");
    }).pipe(Effect.provide(settingsWith().layer)),
  );
});

const diagnosticsSetup = (
  options: {
    readonly clipboardFails?: boolean;
    readonly initial?: unknown;
    readonly language?: Language;
  } = {},
) => {
  const logger = recordingLogger();
  const clipboard = recordingClipboard({ fail: options.clipboardFails ?? false });
  const settings = settingsWith({ initial: options.initial }, options.language);
  const layer = Layer.mergeAll(settings.layer, logger.layer, clipboard.layer, testHostInfo);
  return { logger, clipboard, notifier: settings.notifier, layer };
};

describe("buildDiagnostics", () => {
  it.effect("reports versions, settings status and recent entries", () => {
    const { layer } = diagnosticsSetup({ initial: { rootFolder: 5 } });
    return Effect.gen(function* () {
      const logger = yield* Logger;
      yield* logger.log({ level: "warn", event: "vault.read.failed", data: { attempt: 2 } });
      const report = yield* buildDiagnostics;
      assert.include(report, "0.1.0");
      assert.include(report, "1.15.1");
      assert.include(report, "test");
      assert.match(report, /Einstellungen beschreibbar: ja/);
      assert.include(report, "Wurzelordner");
      assert.include(report, "vault.read.failed");
      assert.include(report, '"attempt":2');
    }).pipe(Effect.provide(layer));
  });

  it.effect("names the error of an entry and its frames but never its message", () => {
    const { layer } = diagnosticsSetup();
    return Effect.gen(function* () {
      const logger = yield* Logger;
      yield* logger.log({
        level: "error",
        event: "note.parse.failed",
        data: { lines: 3, readOnly: true },
        error: {
          name: "VaultError",
          message: "File already exists: Ahornweg/Punkt 12.md",
          frames: ["parse (main.js:1:2)"],
        },
      });
      const report = yield* buildDiagnostics;
      assert.include(report, "note.parse.failed");
      assert.include(report, '{"lines":3,"readOnly":true}');
      assert.include(report, "VaultError");
      assert.include(report, "parse (main.js:1:2)");
      for (const secret of ["Ahornweg", "Punkt", "already exists"]) {
        assert.notInclude(report, secret);
      }
    }).pipe(Effect.provide(layer));
  });

  it.effect("includes at most 50 entries", () => {
    const { layer } = diagnosticsSetup();
    return Effect.gen(function* () {
      const logger = yield* Logger;
      for (let index = 0; index < 70; index += 1) {
        yield* logger.log({ level: "warn", event: `entry.${index}` });
      }
      const report = yield* buildDiagnostics;
      assert.notMatch(report, /entry\.19\b/);
      assert.include(report, "entry.20");
      assert.include(report, "entry.69");
      assert.strictEqual(report.match(/entry\.\d+/g)?.length, 50);
    }).pipe(Effect.provide(layer));
  });
});

describe("copyDiagnostics", () => {
  it.effect("copies the report and confirms", () => {
    const { clipboard, notifier, layer } = diagnosticsSetup();
    return Effect.gen(function* () {
      yield* copyDiagnostics;
      assert.strictEqual(clipboard.writes().length, 1);
      assert.include(clipboard.writes()[0] ?? "", "1.15.1");
      assert.deepStrictEqual(notifier.messages().at(-1), {
        severity: "info",
        title: "Diagnose kopiert",
        detail: "Füge den Bericht in deine Support-Anfrage ein.",
      });
    }).pipe(Effect.provide(layer));
  });

  it.effect("confirms in the UI language", () => {
    const { notifier, layer } = diagnosticsSetup({ language: "en" });
    return Effect.gen(function* () {
      yield* copyDiagnostics;
      assert.deepStrictEqual(notifier.messages().at(-1), {
        severity: "info",
        title: "Diagnostics copied",
        detail: "Paste the report into your support request.",
      });
    }).pipe(Effect.provide(layer));
  });

  it.effect("shows the clipboard message when copying fails", () => {
    const { notifier, layer } = diagnosticsSetup({ clipboardFails: true });
    return Effect.gen(function* () {
      yield* copyDiagnostics;
      const last = notifier.messages().at(-1);
      assert.strictEqual(last?.severity, "error");
      assert.strictEqual(last?.action, "retry");
    }).pipe(Effect.provide(layer));
  });
});
