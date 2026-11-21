import { Cause, Effect, Layer } from "effect";
import { TFile, type EventRef, type Events, type Plugin, type TAbstractFile } from "obsidian";
import { reportDefect } from "../../../application/shell/defects";
import { EventBus } from "../../../application/shell/event-bus";
import { AppEvent } from "../../../application/shell/events";
import type { Incidents, Logger, Messages, Notifier } from "../../../application/shell/ports";

type ColorScheme = "light" | "dark";

const currentScheme = (): ColorScheme =>
  activeDocument.body.classList.contains("theme-dark") ? "dark" : "light";

const ifFile =
  (make: (file: TFile) => AppEvent) =>
  (file: TAbstractFile): AppEvent | undefined =>
    file instanceof TFile ? make(file) : undefined;

const pathAndExtension = (file: TFile) => ({ path: file.path, extension: file.extension });

/**
 * Publishes Obsidian's vault, metadata-cache and workspace events as `AppEvent`s for one runtime.
 *
 * - Host events are held back until the layout is ready (Obsidian fires `create` for every
 *   existing file while it starts); then `LayoutReady` is published first.
 * - Every listener is also handed to `plugin.registerEvent`, so Obsidian detaches it synchronously
 *   in `unload()`, before the runtime's asynchronous dispose has finished.
 * - Every listener is removed with `offref` when the runtime's scope closes, so a bootstrap that
 *   fails or is aborted leaves nothing behind even though the plugin itself is not unloaded.
 *   Obsidian's `offref` removes a ref by identity and ignores one that is already gone, so the
 *   second release is harmless.
 * - Mapping and publishing run synchronously inside Obsidian's callback. A defect goes to
 *   `reportDefect` and never throws into Obsidian.
 */
export const hostEventsLayer = (plugin: Plugin) =>
  Layer.effectDiscard(
    Effect.gen(function* () {
      const bus = yield* EventBus;
      const context = yield* Effect.context<Logger | Incidents | Notifier | Messages>();
      const { vault, metadataCache, workspace } = plugin.app;
      let ready = false;
      let active = true;
      let scheme = currentScheme();

      const publish = (build: () => AppEvent | undefined): void => {
        const program = Effect.suspend(() => {
          const event = build();
          return event === undefined ? Effect.void : bus.publish(event);
        }).pipe(
          Effect.catchCause((cause) =>
            Cause.hasInterruptsOnly(cause)
              ? Effect.void
              : Effect.asVoid(reportDefect(Cause.squash(cause))),
          ),
        );
        // The exit is dropped: it is a failure only if the defect path itself failed.
        Effect.runSyncExitWith(context)(program);
      };
      const whenReady =
        <Args extends unknown[]>(build: (...args: Args) => AppEvent | undefined) =>
        (...args: Args): void => {
          if (ready) publish(() => build(...args));
        };
      const schemeChange = (): AppEvent | undefined => {
        const next = currentScheme();
        if (next === scheme) return undefined;
        scheme = next;
        return AppEvent.ColorSchemeChanged({ scheme: next });
      };

      yield* Effect.acquireRelease(
        Effect.sync((): readonly (readonly [Events, EventRef])[] => [
          [
            vault,
            vault.on(
              "create",
              whenReady(ifFile((file) => AppEvent.FileCreated(pathAndExtension(file)))),
            ),
          ],
          [
            vault,
            vault.on(
              "modify",
              whenReady(ifFile((file) => AppEvent.FileModified(pathAndExtension(file)))),
            ),
          ],
          [
            vault,
            vault.on(
              "delete",
              whenReady(ifFile((file) => AppEvent.FileDeleted(pathAndExtension(file)))),
            ),
          ],
          [
            vault,
            vault.on(
              "rename",
              whenReady((file: TAbstractFile, oldPath: string) =>
                ifFile((renamed) =>
                  AppEvent.FileRenamed({ ...pathAndExtension(renamed), oldPath }),
                )(file),
              ),
            ),
          ],
          [
            metadataCache,
            metadataCache.on(
              "changed",
              whenReady((file: TFile) => AppEvent.MetadataChanged(pathAndExtension(file))),
            ),
          ],
          [
            workspace,
            workspace.on(
              "file-open",
              whenReady((file: TFile | null) =>
                AppEvent.ActiveFileChanged({ path: file?.path ?? null }),
              ),
            ),
          ],
          [
            workspace,
            workspace.on("css-change", () => {
              // Track the scheme before the layout is ready too, so the first change is real.
              if (ready) publish(schemeChange);
              else scheme = currentScheme();
            }),
          ],
        ]).pipe(
          Effect.tap((refs) =>
            Effect.sync(() => {
              for (const [, ref] of refs) plugin.registerEvent(ref);
            }),
          ),
        ),
        (refs) =>
          Effect.sync(() => {
            active = false;
            for (const [emitter, ref] of refs) emitter.offref(ref);
          }),
      );

      // Obsidian cannot cancel this callback, so it checks that the runtime is still alive.
      workspace.onLayoutReady(() => {
        if (!active) return;
        ready = true;
        publish(() => AppEvent.LayoutReady());
      });
    }),
  );
