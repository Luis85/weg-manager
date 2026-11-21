import { Cause, Exit, ManagedRuntime, Result, type Effect } from "effect";
import type { App } from "obsidian";
import { NoteStore, type Frontmatter, type NewNote } from "../../../src/application/notes";
import { noteStoreLayer } from "../../../src/infrastructure/obsidian/notes";

/** What a store call ended with, as plain data that survives `executeObsidian`. */
export type Outcome<A> =
  { readonly ok: true; readonly value: A } | { readonly ok: false; readonly tag: string };

/** An update as data: a patch to write, or a failure the change decides on instead. */
export type ProbeChange =
  { readonly set?: Frontmatter; readonly remove?: readonly string[] } | { readonly refuse: string };

const tagOf = (cause: Cause.Cause<unknown>): string => {
  const error = Cause.squash(cause);
  return typeof error === "object" && error !== null && "_tag" in error
    ? String(error._tag)
    : "defect";
};

/**
 * The real Obsidian `NoteStore` adapter as promise-returning calls with plain results. The e2e
 * probe plugin (`tests/e2e/probe-plugin/`) exposes it inside Obsidian; the unit tests run the
 * same calls on the Obsidian double.
 */
export const probeApi = (app: App) => {
  const runtime = ManagedRuntime.make(noteStoreLayer(app));
  const run = async <A, E>(
    use: (store: NoteStore["Service"]) => Effect.Effect<A, E>,
  ): Promise<Outcome<A>> => {
    const exit = await runtime.runPromiseExit(NoteStore.use(use));
    return Exit.isSuccess(exit)
      ? { ok: true, value: exit.value }
      : { ok: false, tag: tagOf(exit.cause) };
  };
  return {
    list: () => run((store) => store.list),
    read: (path: string) => run((store) => store.read(path)),
    create: (note: NewNote) => run((store) => store.create(note)),
    update: (path: string, change: ProbeChange) =>
      run((store) =>
        store.update(path, () =>
          "refuse" in change ? Result.fail({ _tag: change.refuse }) : Result.succeed(change),
        ),
      ),
    trash: (path: string) => run((store) => store.trash(path)),
    rename: (path: string, newName: string) => run((store) => store.rename(path, newName)),
    dispose: () => runtime.dispose(),
  };
};

export type ProbeApi = ReturnType<typeof probeApi>;
