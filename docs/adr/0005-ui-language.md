# ADR 0005 · UI language follows Obsidian

- Status: accepted; the greeting it describes was removed and the catalog paths moved on 2026-11-21 (see the notes at the end)
- Date: 2026-11-21

## Context

Every text the plugin showed was German and hard-wired: issue sentences in `src/domain/settings.ts`, messages in `src/application/user-messages.ts`, command names, the ribbon title, the settings tab and every Vue component. Nuxt UI's own labels (close buttons) were fixed to `de` in `ShellApp.vue`. Obsidian has had `getLanguage()` since 1.8.7, and its guidelines and lint rule `prefer-get-language` ask plugins to use it ([Plugin research](../research/Plugin%20research%20-%20Obsidian%20best%20practices.md) item 13). The owner decided: German for German Obsidian, English for every other language. The sample greeting's default follows the language as well, a greeting the user typed stays as typed, and files written by earlier versions that hold the old default "Hello from WEG Manager" count as not customised.

## Decision

- **Language selection.** `languageFromCode` (`src/application/i18n/index.ts`) maps Obsidian's code to `"de" | "en"`: `de` and any `de-*` or `de_*` variant become German, everything else English. Obsidian 1.15.1 itself only uses `de`, but it derives its default from `navigator.language` and also accepts a path to a custom translation file; both fall through to English.
- **Fixed per plugin load.** Obsidian restarts when its language changes, so `hostLanguage()` (`src/infrastructure/obsidian/language.ts`, the only caller of `getLanguage()`) is read once in `bootstrap`. `reportUnloadFailure` reads it again, because it runs when the runtime is gone.
- **Where the language lives.** A `Messages` service (`src/application/ports.ts`) holds the catalog of that language. `obsidianLayer(plugin, language)` provides it, like every other host adapter. Application code takes it with `yield* Messages`; `describeError`, `describeDefect` and `describeSettingsIssues` take it as a parameter, so they stay pure. Bootstrap reads it from the runtime for commands and settings tab. Presentation reads it with `useMessages()` from `src/presentation/runtime/use-runtime.ts` and never imports `obsidian`. It is a plain value, not a stream, because it cannot change during a load. Nuxt UI's locale (`de` or `en` from `@nuxt/ui/locale`) follows `messages.language`.
- **Domain stays language-free.** `decodeSettings` and `validatePatch` return `SettingsIssue` values (`{ code: "greeting.length", max: 200 }`, `{ code: "logLevel.unknown", allowed }`, `{ code: "schema.newer", version }`, …) with the same fallback and read-only behaviour as before. `InvalidSettingsError.issues` and `SettingsStatus.issues` carry them. `describeIssue` words them in the catalog's language.
- **One typed catalog per language.** `src/application/i18n/de.ts` and `en.ts` are both typed `Catalog` (`catalog.ts`), so a key missing in one language fails typecheck. Texts with parameters are functions (`markdownFiles(count)`, `defect.detail(incidentId)`, one function per issue code). Severity and action of a `UserMessage` stay in `user-messages.ts`, because they do not depend on the language. The German texts are unchanged. English is sentence case, like Obsidian's own UI. "WEG Manager" is a product name and is not translated.
- **Default greeting: `null` in memory, no key in the file.** `Settings.greeting` is `string | null`; `null` means "not customised" and the view shows `greetingOf(settings, messages)`, the catalog's `defaultGreeting` ("Hallo von WEG Manager" / "Hello from WEG Manager"). `encodeSettings` leaves the key out of `data.json` while it is `null`. On decode a missing key, an explicit `null` and the trimmed legacy default "Hello from WEG Manager" (`LEGACY_DEFAULT_GREETING`) all become `null`, without an issue. `updateGreeting` stores the current language's default as `null` too, so saving an untouched field does not freeze the default into a custom greeting.
- **`SETTINGS_VERSION` stays 1.** The change is backward compatible, so there is nothing to migrate: an old file decodes as before, and the legacy default simply reads as not customised. The file is not rewritten on load; the next save drops the greeting key. A schema bump would have made every older plugin version on another device (Sync) treat the new file as "newer version" and go read-only. Without the greeting key an older version falls back to its own default greeting, also without an issue.
- **Diagnostics stay German.** The report built by `copy-diagnostics` is for support, not for reading in the UI. One format in every language is easier to compare and search, and log event names are English codes anyway. It renders settings issues with the German catalog and adds a line `Sprache: de|en`, so support knows what the user saw. The notice that confirms the copy follows the UI language.

## Consequences

- A new user-visible text is a new key in `Catalog` and in both catalogs; typecheck fails until both have it. `tests/unit/application/i18n.test.ts` also compares the two catalogs' key shapes and pins every surface text in both languages.
- Mutation testing covers the catalogs (they live in `src/application`), so every text needs an exact-text test; tests of a feature pin German, and add English where the wording matters.
- A user who types the German default greeting in a German Obsidian gets the English default after switching Obsidian to English. That is the intended reading of "not customised".
- Ribbon entries are keyed by `<plugin id>:<title>` in Obsidian. A translated title would give the icon a new id on a language change, so Obsidian would forget its position and hidden state. Resolved (owner decision, 2026-11-21): the ribbon title is the product name "WEG Manager" (`PRODUCT_NAME`) in every language, so the id stays the same. Bootstrap adds the icon after the commands, so a failed load leaves none behind without Obsidian's internal `removeRibbonAction`.
- The Obsidian double (`tests/support/obsidian/language.ts`) starts in German; `setLanguage` switches it. The e2e Obsidian starts German through Chromium's `--lang=de`; `language.e2e.ts` switches to English.
- A third language means a new `Language` member, a new catalog, a Nuxt UI locale import and a mapping in `languageFromCode`.

## Amendment, 2026-11-21: the greeting is gone

The sample greeting was demo data of the plugin shell. The community slice (PBI-56) replaced the demo, and with it went `Settings.greeting`, `greetingOf`, `LEGACY_DEFAULT_GREETING`, the issue code `greeting.length` and the catalog key `defaultGreeting`. An old `greeting` key in `data.json` is an unknown key now and is dropped on decode without an issue; `SETTINGS_VERSION` stays 1.

Everything else in this ADR stands: the language is chosen once per plugin load from Obsidian's, the domain returns issue codes and the catalogs word them, there is one typed catalog per language and module, and the diagnostics report stays German. The rule the greeting illustrated also stands for the settings that remain: a value that is still the default is left out of the file, so older versions read it without an issue (`rootFolder` today).

## Amendment, 2026-11-21: where things live after the module split

The decision stands; the files moved with [ADR 0006](0006-module-structure.md):

| This ADR says | Now |
| --- | --- |
| `src/application/i18n/index.ts` (`languageFromCode`) | `src/application/messages.ts`, which also holds `Catalog`, `de`, `en`, `catalogFor` and `messagesLayer` |
| `src/application/i18n/de.ts`, `en.ts`, `catalog.ts` | one catalog per module in `src/application/<module>/i18n/` (`catalog.ts`, `de.ts`, `en.ts`, `describe.ts`); `Catalog` has one key per module, so a key missing in one language still fails typecheck |
| `src/infrastructure/obsidian/language.ts` | `src/infrastructure/obsidian/shell/language.ts` |
| `Messages` in `src/application/ports.ts` | `src/application/shell/ports.ts`; module code reads its own part (`(yield* Messages).shell`) |
| `useMessages()` from `src/presentation/runtime/use-runtime.ts` | `src/presentation/shell/runtime/use-runtime.ts` |
| `src/domain/settings.ts`, `describeIssue`, `user-messages.ts` | `src/domain/shell/settings.ts`, `src/application/shell/i18n/describe.ts`, and the describers of each module |
| `tests/unit/application/i18n.test.ts` | `tests/unit/application/shell/i18n.test.ts`, and one `i18n.test.ts` or `user-messages.test.ts` per module |
