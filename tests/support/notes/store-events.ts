import { Effect, Result } from "effect";
import { AppEvent } from "../../../src/application/events";
import { NoteStore } from "../../../src/application/notes";
import { COMMUNITY } from "./fixture";

const A = "WEG Manager/Test/A.md";
const B = "WEG Manager/Test/B.md";
const C = "WEG Manager/Test/C.md";

const md = { extension: "md" } as const;

/**
 * Store calls and outside edits, one step at a time, with the file events the plugin's event bus
 * carries for each. For the Obsidian adapter they come from the host event adapter; the in-memory
 * store publishes them itself, so a test or the harness sees the same events for the same calls
 * (`tests/unit/infrastructure/notes/memory-note-store-events.test.ts`,
 * `tests/dom/infrastructure/notes/store-events.test.ts`). Folders are not published.
 */
export const STORE_EVENT_STEPS: readonly {
  readonly name: string;
  readonly run: (
    store: NoteStore["Service"],
    seed: (path: string, frontmatter: Record<string, unknown>) => Promise<void>,
  ) => Effect.Effect<unknown, unknown>;
  readonly events: readonly AppEvent[];
}[] = [
  {
    name: "create",
    run: (store) => store.create({ folder: "WEG Manager/Test", name: "A", frontmatter: COMMUNITY }),
    events: [
      AppEvent.FileCreated({ path: A, ...md }),
      AppEvent.MetadataChanged({ path: A, ...md }),
    ],
  },
  {
    name: "update",
    run: (store) => store.update(A, () => Result.succeed({ set: { name: "Neu" } })),
    events: [
      AppEvent.FileModified({ path: A, ...md }),
      AppEvent.MetadataChanged({ path: A, ...md }),
    ],
  },
  {
    name: "update that changes nothing",
    run: (store) => store.update(A, () => Result.succeed({ set: { name: "Neu" } })),
    events: [],
  },
  {
    name: "rename",
    run: (store) => store.rename(A, "B"),
    events: [AppEvent.FileRenamed({ path: B, oldPath: A, ...md })],
  },
  {
    name: "trash",
    run: (store) => store.trash(B),
    events: [AppEvent.FileDeleted({ path: B, ...md })],
  },
  {
    name: "a note from outside",
    run: (_, seed) => Effect.promise(() => seed(C, COMMUNITY)),
    events: [
      AppEvent.FileCreated({ path: C, ...md }),
      AppEvent.MetadataChanged({ path: C, ...md }),
    ],
  },
  {
    name: "an outside edit",
    run: (_, seed) => Effect.promise(() => seed(C, { ...COMMUNITY, name: "Draußen" })),
    events: [
      AppEvent.FileModified({ path: C, ...md }),
      AppEvent.MetadataChanged({ path: C, ...md }),
    ],
  },
];
