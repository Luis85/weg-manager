import { Effect, Layer, ManagedRuntime } from "effect";
import type { Plugin } from "obsidian";
import type { AppEvent } from "../../../src/application/events";
import { EventBus, EventBusLive } from "../../../src/application/shell/event-bus";
import { hostEventsLayer } from "../../../src/infrastructure/obsidian/shell/events";
import {
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testMessages,
} from "../../support/layers";

/**
 * The plugin's real host event adapter (`hostEventsLayer`) on a runtime of its own, built in the
 * probe's `onload`, so a spec sees what the adapter publishes in real Obsidian without a hook in
 * the plugin. `seen` runs inside each publish, at the moment of the event. Defects go to an
 * in-memory logger and notifier, never to the screen.
 */
export const hostEventsProbe = (plugin: Plugin, seen: (event: AppEvent) => void) => {
  const bus = Layer.effect(
    EventBus,
    EventBus.useSync((live) =>
      EventBus.of({
        ...live,
        publish: (event) =>
          Effect.suspend(() => {
            seen(event);
            return live.publish(event);
          }),
      }),
    ),
  ).pipe(Layer.provideMerge(EventBusLive));
  const runtime = ManagedRuntime.make(
    hostEventsLayer(plugin).pipe(
      Layer.provideMerge(
        Layer.mergeAll(
          bus,
          recordingLogger().layer,
          recordingNotifier().layer,
          sequentialIncidents(),
          testMessages,
        ),
      ),
    ),
  );
  runtime.runSync(Effect.void);
  return runtime;
};
