import { Context, Effect, Layer, PubSub, Stream, type Scope } from "effect";
import type { AppEvent } from "../events";

/**
 * The plugin's one event bus. Host adapters and use cases publish `AppEvent`s; features subscribe.
 * Each subscriber has its own subscription, so a subscriber that fails or dies ends only its own
 * stream: the bus and every other subscriber keep running.
 */
// Stryker disable StringLiteral: a service key only has to be unique; tests cannot observe its text.
export class EventBus extends Context.Service<
  EventBus,
  {
    publish(event: AppEvent): Effect.Effect<void>;
    /**
     * Subscribes now and returns the stream of every later event, so a consumer that is forked
     * afterwards misses nothing published in between.
     */
    readonly subscribe: Effect.Effect<Stream.Stream<AppEvent>, never, Scope.Scope>;
  }
>()("weg-manager/application/EventBus") {}
// Stryker restore StringLiteral

/**
 * An unbounded `PubSub`: an Obsidian callback is synchronous and cannot wait for back-pressure,
 * and a dropping or sliding strategy would lose file events during a bulk sync. A message is held
 * only until every current subscriber has taken it, and with no subscriber it is discarded. The
 * PubSub shuts down with the runtime's scope, which ends every subscriber's stream.
 */
export const EventBusLive = Layer.effect(
  EventBus,
  Effect.gen(function* () {
    const pubsub = yield* Effect.acquireRelease(PubSub.unbounded<AppEvent>(), PubSub.shutdown);
    return EventBus.of({
      publish: (event) => Effect.asVoid(PubSub.publish(pubsub, event)),
      subscribe: Effect.map(PubSub.subscribe(pubsub), Stream.fromSubscription),
    });
  }),
);
