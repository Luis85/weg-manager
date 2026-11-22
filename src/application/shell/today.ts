// Stryker disable StringLiteral: the only string here is a service key; it only has to be unique and tests cannot observe its text.
import { Context, Effect, Option, Stream, SubscriptionRef } from "effect";
import type { CalendarDay } from "../../domain/shell";

/**
 * The user's local calendar day (glossary: today), for values derived from it, such as "overdue".
 * A port: the plugin's adapter reads the machine's clock, the tests' adapter a day they set.
 * `current` reads the clock each time, so it is right even when a timer was asleep, and publishes
 * a day it finds new; `changes` emits the current day first, then each new day once, at local
 * midnight, after a change of the system clock, or after the machine wakes.
 */
export class Today extends Context.Service<
  Today,
  {
    readonly current: Effect.Effect<CalendarDay>;
    readonly changes: Stream.Stream<CalendarDay>;
  }
>()("weg-manager/application/Today") {}

/** The day read, and the day to publish: none while it is the day held. */
const publishIfNew = (
  held: CalendarDay,
  day: CalendarDay,
): readonly [CalendarDay, Option.Option<CalendarDay>] => [
  day,
  day === held ? Option.none() : Option.some(day),
];

/**
 * The `Today` service over `read`, the adapter's source of the local day, and `check`, which an
 * adapter runs when its timer fires: both read the source and publish the day if it is new, as one
 * step, so two checks cannot publish an older day after a newer one.
 */
export const makeToday = (read: Effect.Effect<CalendarDay>) =>
  Effect.gen(function* () {
    const ref = yield* SubscriptionRef.make(yield* read);
    const check = SubscriptionRef.modifySomeEffect(ref, (held) =>
      Effect.map(read, (day) => publishIfNew(held, day)),
    );
    return { today: Today.of({ current: check, changes: SubscriptionRef.changes(ref) }), check };
  });

/** The local day now, for `useStream`. */
export const today = Today.use((service) => service.current);

/** The local day: the current one first, then each new day. */
export const todayChanges = Stream.unwrap(Today.use((service) => Effect.succeed(service.changes)));
