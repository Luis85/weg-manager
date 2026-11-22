import { Effect, Result } from "effect";
import { defineRecords, type RecordRow } from "../../../src/application/notes";
import { draftValues, editedValues, type FormInput } from "../../../src/domain/notes";
import { testItem } from "./test-note-type";
import { testRecord } from "./test-record-type";

// A test "feature" on the record kit with every field kind (PBI-71): the records of the test-only
// `testRecord` type, those of the test items it refers to, and its use cases. It has no rules of
// its own; a value the type rejects is a defect here, as no form of this feature can make one.

export const testRecords = defineRecords({
  type: testRecord,
  title: "title",
  fallbackName: () => "Akte",
  log: "test-records",
});

/** The test items, as the target of `item_id` and `item_ids`. */
export const testItems = defineRecords({
  type: testItem,
  title: "title",
  fallbackName: () => "Eintrag",
  log: "test-items",
});

type Input = FormInput<typeof testRecord.fields>;
export type TestRecordRow = RecordRow<typeof testRecord.fields>;

const valid = (values: Readonly<Record<string, unknown>>) =>
  Effect.orDie(Effect.fromResult(Result.mapError(testRecord.parse(values), () => "invalid")));

export const createTestRecord = (input: Input) =>
  Effect.flatMap(valid(draftValues(testRecord, input)), testRecords.create);

export const updateTestRecord = (row: TestRecordRow, input: Input) =>
  Effect.flatMap(
    valid(editedValues(testRecord, input, draftValues(testRecord, input), row.frontmatter)),
    (values) => testRecords.update(row, values),
  );
