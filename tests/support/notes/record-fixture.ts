import { Duration, Effect, Layer } from "effect";
import { TestClock } from "effect/testing";
import { defineRecords, NoteStore } from "../../../src/application/notes";
import { INDEX_BATCH_QUIET } from "../../../src/application/notes/index-batches";
import { defineNoteType, lineOfText, required, text } from "../../../src/domain/notes";
import { sequentialIdGenerator } from "../../../src/infrastructure/memory/notes";
import { indexFixture, settle, untilUnindexed, vaultReady } from "./index-fixture";

/**
 * A small record type for the record kit's tests (`defineRecords`): a required title that names
 * the file, a required code the file name falls back to, an optional note. New notes go to
 * `<rootFolder>/Akten/`.
 */
export const sampleType = defineNoteType({
  type: "sample",
  version: 1,
  folder: "Akten",
  fields: {
    title: required(text({ schema: lineOfText(100), issue: "title.invalid" })),
    code: required(text()),
    note: text(),
  },
  migrations: {},
});

/** The records of the sample type, as a feature declares them. */
export const samples = defineRecords({
  type: sampleType,
  title: "title",
  fallbackName: (values) => values.code,
  log: "samples",
});

export const SAMPLE_FOLDER = "WEG Manager/Akten";

/** The id of the `n`-th sample `sequentialIdGenerator` makes. */
export const sampleId = (n: number) =>
  `sample-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

/** A valid sample note's frontmatter; `extra` overrides any key. */
export const sampleNote = (n: number, extra: Record<string, unknown> = {}) => ({
  schema: "weg-manager.sample/v1",
  id: sampleId(n),
  title: `Akte ${n}`,
  code: `A${n}`,
  ...extra,
});

/**
 * The record kit over the note index (sample type only), the in-memory `NoteStore` and a
 * sequential id generator. Its effects run under `TestClock`: `ready` builds the index, `indexed`
 * lets it read every write since.
 */
export const recordFixture = (options: { readonly settings?: unknown } = {}) => {
  const index = indexFixture({ types: [sampleType], settings: options.settings });
  const ids = sequentialIdGenerator();
  return { ...index, layer: Layer.merge(index.layer, ids.layer) };
};

/** The first sample in the list, as a form loads it. */
export const firstSample = Effect.map(samples.list, ({ records }) => {
  const [record] = records;
  if (record === undefined) throw new Error("no sample");
  return record;
});

/** The paths of every record note in the store, sorted. */
export const storedPaths = NoteStore.use((store) => store.list).pipe(
  Effect.map((notes) => notes.map((note) => note.path)),
);

/** Builds the index: `VaultReady`, then the first build. */
export const ready = Effect.andThen(
  vaultReady,
  untilUnindexed((snapshot) => snapshot.ready),
);

/** Lets the index read what was written or seeded since: one quiet batch. */
export const indexed = Effect.andThen(
  TestClock.adjust(Duration.toMillis(INDEX_BATCH_QUIET)),
  settle,
);

/** The note at `path` as the store holds it now. */
export const stored = (path: string) => NoteStore.use((store) => store.read(path));
