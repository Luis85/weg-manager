import { Context, Effect, Equal, Layer, Semaphore, Stream, SubscriptionRef } from "effect";
import {
  communityType,
  isCommunityChoice,
  selectableIds,
  selectedCommunity,
  type CommunityFields,
} from "../../domain/communities";
import { NoteIndex, type NoteSnapshot } from "../notes";
import { DeviceStore } from "../shell";
import { toCommunityList } from "./list";

/** The device store key of the selection (ADR 0008): per device and vault, never in `data.json`. */
export const SELECTION_KEY = "community-selection";

/** The community every open view works in (glossary: community selection). */
export type CommunitySelection = {
  /** False until the note index is built: until then nothing is selected or asked. */
  readonly ready: boolean;
  /** The id of the selected community, or none. */
  readonly id: string | undefined;
  /** Two or more selectable communities and none selected: the frame asks the user to choose. */
  readonly choiceNeeded: boolean;
};

/**
 * One selection for all open views and pop-outs (ADR 0008), with a current value and a stream like
 * the settings. `select` stores the choice for this device.
 */
export class CommunitySelectionService extends Context.Service<
  CommunitySelectionService,
  {
    readonly current: Effect.Effect<CommunitySelection>;
    /** The current selection first, then every change. */
    readonly changes: Stream.Stream<CommunitySelection>;
    select(id: string): Effect.Effect<void>;
  }
>()("weg-manager/application/CommunitySelectionService") {}

/** The selection the rule gives for the stored choice and the index's communities. */
const derive = (stored: unknown, snapshot: NoteSnapshot<CommunityFields>): CommunitySelection => {
  if (!snapshot.ready) return { ready: false, id: undefined, choiceNeeded: false };
  // The list adds the issues between communities (a duplicate short code) to the index's own.
  const ids = selectableIds(toCommunityList(snapshot).communities);
  const id = selectedCommunity(stored, ids);
  return { ready: true, id, choiceNeeded: id === undefined && ids.length > 0 };
};

/**
 * The selection over the note index and the device store. It follows the index's communities and
 * applies the rule (`selectedCommunity`) to each snapshot, over the communities without issues
 * (`selectableIds`, owner decision 22.11.2026). A community the rule selects by itself (the only
 * one) is stored too when no community's id is stored, once the index has read the vault without a
 * failure, so adding a second community keeps it selected. A stored community that is gone, or has
 * an issue now, stays stored, also while the rule selects another: it counts again once its note
 * comes back or is repaired, as after Sync. Only the user's choice (`select`) replaces it.
 */
export const communitySelectionLayer = Layer.effect(
  CommunitySelectionService,
  Effect.gen(function* () {
    const index = yield* NoteIndex;
    const device = yield* DeviceStore;
    /** As the device store holds it; the rule uses it only if it is a current community's id. */
    let stored: unknown = yield* device.read(SELECTION_KEY);
    let latest = yield* index.snapshot(communityType);
    const ref = yield* SubscriptionRef.make(derive(stored, latest));
    const lock = yield* Semaphore.make(1);

    const store = (id: string) =>
      Effect.andThen(
        Effect.sync(() => {
          stored = id;
        }),
        device.write(SELECTION_KEY, id),
      );
    const publish = Effect.gen(function* () {
      const next = derive(stored, latest);
      if (!Equal.equals(yield* SubscriptionRef.get(ref), next)) {
        yield* SubscriptionRef.set(ref, next);
      }
    });
    const follow = (snapshot: NoteSnapshot<CommunityFields>) =>
      lock.withPermit(
        Effect.gen(function* () {
          latest = snapshot;
          const { id } = derive(stored, snapshot);
          if (snapshot.failure === undefined && id !== undefined && !isCommunityChoice(stored)) {
            yield* store(id);
          }
          yield* publish;
        }),
      );

    yield* Effect.forkScoped(Stream.runForEach(index.changes(communityType), follow));

    return CommunitySelectionService.of({
      current: SubscriptionRef.get(ref),
      changes: SubscriptionRef.changes(ref),
      select: (id) => lock.withPermit(Effect.andThen(store(id), publish)),
    });
  }),
);

/** The selection now, for `useStream`. Never suspends. */
export const communitySelection = CommunitySelectionService.use((service) => service.current);

/** The selection: the current one first, then every change. */
export const communitySelectionChanges = Stream.unwrap(
  CommunitySelectionService.use((service) => Effect.succeed(service.changes)),
);

/** Makes `id` the selected community for every open view, and stores it for this device. */
export const selectCommunity = (id: string) =>
  CommunitySelectionService.use((service) => service.select(id));
