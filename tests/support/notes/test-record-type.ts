import {
  checkbox,
  date,
  defineNoteType,
  list,
  number,
  reference,
  references,
  required,
  text,
} from "../../../src/domain/notes";
import { OTHER_ID, TEST_ID } from "./test-note-type";

/**
 * A test-only record type with one field of every kind (PBI-71): text, date, number, checkbox,
 * list, a reference and a list of references to test items (`test-note-type.ts`). No product type
 * has a field of any kind but text yet, so the form kit's handling of the others is proved here.
 */
export const testRecord = defineNoteType({
  type: "test-record",
  version: 1,
  folder: "Akten",
  fields: {
    title: required(text()),
    due: date(),
    count: number(),
    done: checkbox(),
    tags: list(),
    item_id: reference("test-item"),
    item_ids: references("test-item"),
  },
  migrations: {},
});

export const RECORD_ID = "test-record-00000000-0000-4000-8000-0000000000a1";

/** A test record with every field set; `extra` overrides any key. */
export const recordNote = (extra: Record<string, unknown> = {}) => ({
  schema: "weg-manager.test-record/v1",
  id: RECORD_ID,
  title: "Akte 1",
  due: "2026-11-22",
  count: 5,
  done: true,
  tags: ["rot", "grün"],
  item_id: TEST_ID,
  item_ids: [TEST_ID, OTHER_ID],
  ...extra,
});
