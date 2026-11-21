import { Context, Effect, Layer, PubSub, Stream, type Scope } from "effect";
import type { AppEvent, AppEventTag } from "./events";

type EventOf<Tag extends AppEventTag> = Extract<AppEvent, { readonly _tag: Tag }>;

/**
 * The plugin's one event bus. Host adapters and use cases publish `AppEvent`s; features subscribe.
 * Each subscriber has its own subscription, so a subscriber that fails or dies ends only its own
 * stream: the bus and every other subscriber keep running.
 */
export class EventBus extends Context.Service<
  EventBus,
  {
    publish(event: AppEvent): Effect.Effect<void>;
    /** Every event from the moment the stream starts running. */
    readonly events: Stream.Stream<AppEvent>;
    /** `events`, narrowed to one member of the union. */
    on<Tag extends AppEventTag>(tag: Tag): Stream.Stream<EventOf<Tag>>;
    /**
     * Subscribes now and returns the stream of every later event. Use it when the consumer is
     * forked: a forked `events` stream subscribes only once its fiber runs and can miss what is
     * published in between.
     */
    readonly subscribe: Effect.Effect<Stream.Stream<AppEvent>, never, Scope.Scope>;
  }
  // Stryker disable next-line StringLiteral: a service key only has to be unique; tests cannot observe its text.
>()("weg-manager/application/EventBus") {}

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
    const events = Stream.fromPubSub(pubsub);
    return EventBus.of({
      publish: (event) => Effect.asVoid(PubSub.publish(pubsub, event)),
      events,
      on: <Tag extends AppEventTag>(tag: Tag) =>
        Stream.filter(events, (event): event is EventOf<Tag> => event._tag === tag),
      subscribe: Effect.map(PubSub.subscribe(pubsub), Stream.fromSubscription),
    });
  }),
);
