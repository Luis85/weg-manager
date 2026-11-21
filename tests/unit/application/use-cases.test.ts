import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { buildDiagnostics } from "../../../src/application/diagnostics";
import { Logger } from "../../../src/application/ports";
import { SettingsServiceLive } from "../../../src/application/settings-service";
import {
  copyDiagnostics,
  countMarkdownFiles,
  setLogLevel,
  setRibbonIconVisible,
  showGreeting,
  updateGreeting,
} from "../../../src/application/use-cases";
import {
  fixedVault,
  inMemoryStore,
  recordingClipboard,
  recordingLogger,
  recordingNotifier,
  testHostInfo,
  type StoreOptions,
} from "../../support/layers";

const settingsWith = (options: StoreOptions = {}) => {
  const notifier = recordingNotifier();
  const layer = SettingsServiceLive.pipe(
    Layer.provideMerge(Layer.mergeAll(inMemoryStore(options).layer, notifier.layer)),
  );
  return { notifier, layer };
};

describe("settings use cases", () => {
  it.effect("updates the greeting, the ribbon flag and the log level", () =>
    Effect.gen(function* () {
      assert.strictEqual((yield* updateGreeting("Servus")).greeting, "Servus");
      assert.strictEqual((yield* setRibbonIconVisible(false)).showRibbonIcon, false);
      assert.strictEqual((yield* setLogLevel("debug")).logLevel, "debug");
    }).pipe(Effect.provide(settingsWith().layer)),
  );

  it.effect("fails updateGreeting with InvalidSettingsError for an empty greeting", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(updateGreeting("  "));
      assert.strictEqual(error._tag, "InvalidSettingsError");
    }).pipe(Effect.provide(settingsWith().layer)),
  );

  it.effect("showGreeting notifies the current greeting", () => {
    const { notifier, layer } = settingsWith({ initial: { greeting: "Moin" } });
    return Effect.gen(function* () {
      yield* showGreeting;
      assert.deepStrictEqual(
        notifier.messages().map((message) => message.detail),
        ["Moin"],
      );
      assert.deepStrictEqual(notifier.messages()[0], {
        severity: "info",
        title: "WEG Manager",
        detail: "Moin",
      });
    }).pipe(Effect.provide(layer));
  });
});

describe("countMarkdownFiles", () => {
  it.effect("returns the vault's count", () =>
    Effect.gen(function* () {
      assert.strictEqual(yield* countMarkdownFiles, 12);
    }).pipe(Effect.provide(fixedVault(12))),
  );

  it.effect("fails with VaultReadError", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(countMarkdownFiles);
      assert.strictEqual(error._tag, "VaultReadError");
    }).pipe(Effect.provide(fixedVault("fail"))),
  );
});

const diagnosticsSetup = (
  options: { readonly clipboardFails?: boolean; readonly initial?: unknown } = {},
) => {
  const logger = recordingLogger();
  const clipboard = recordingClipboard({ fail: options.clipboardFails ?? false });
  const settings = settingsWith({ initial: options.initial });
  const layer = Layer.mergeAll(settings.layer, logger.layer, clipboard.layer, testHostInfo);
  return { logger, clipboard, notifier: settings.notifier, layer };
};

describe("buildDiagnostics", () => {
  it.effect("reports versions, settings status and recent entries", () => {
    const { layer } = diagnosticsSetup({ initial: { greeting: 5 } });
    return Effect.gen(function* () {
      const logger = yield* Logger;
      yield* logger.log({ level: "warn", event: "vault.read.failed", context: { attempt: 2 } });
      const report = yield* buildDiagnostics;
      assert.include(report, "0.1.0");
      assert.include(report, "1.15.1");
      assert.include(report, "test");
      assert.match(report, /Einstellungen beschreibbar: ja/);
      assert.include(report, "Begrüßung");
      assert.include(report, "vault.read.failed");
      assert.include(report, '"attempt":2');
    }).pipe(Effect.provide(layer));
  });

  it.effect("redacts note content, paths, names and long strings", () => {
    const { layer } = diagnosticsSetup();
    return Effect.gen(function* () {
      const logger = yield* Logger;
      yield* logger.log({
        level: "error",
        event: "note.parse.failed",
        context: {
          content: "Eigentümerversammlung geheim",
          path: "Gemeinschaften/Ahornweg.md",
          name: "Ahornweg.md",
          body: "Text",
          text: "Mehr Text",
          long: "x".repeat(201),
          nested: { path: "a/b.md" },
          short: "ok",
        },
      });
      const report = yield* buildDiagnostics;
      for (const secret of ["geheim", "Ahornweg", "Mehr Text", "a/b.md", "x".repeat(201)]) {
        assert.notInclude(report, secret);
      }
      assert.include(report, '"short":"ok"');
      assert.include(report, "[redacted]");
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
