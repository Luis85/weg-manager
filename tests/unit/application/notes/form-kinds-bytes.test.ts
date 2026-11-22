import { Result } from "effect";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { editChange } from "../../../../src/application/notes";
import { updateNoteText } from "../../../../src/application/notes/note-text";
import { draftValues, editedValues, formInput, type FormInput } from "../../../../src/domain/notes";
import { OTHER_ID } from "../../../support/notes/test-note-type";
import { testRecord } from "../../../support/notes/test-record-type";

type Input = FormInput<typeof testRecord.fields>;

// A test record as a person or another tool may write it: every kind in a form the serialiser
// would not choose itself (a flow list, a number with a fraction zero, `True`, comments), so a
// field rewritten by mistake shows as changed bytes.
const TEXT = [
  "---",
  "schema: weg-manager.test-record/v1",
  "id: test-record-00000000-0000-4000-8000-0000000000a1",
  "title: Akte 1",
  "due: 2026-11-22 # Frist",
  "count: 5.0",
  "done: True",
  "tags: [rot, grün]",
  "item_id: test-item-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21 # fehlt im Tresor",
  "item_ids:",
  "  - test-item-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21",
  "  - test-item-00000000-0000-4000-8000-000000000002",
  "---",
  "Eigene Notizen",
  "",
].join("\n");

/** Loads the note into a form, applies `edit` to its input, saves through the merge and the line edit. */
const saved = (edit: (input: Input) => Input) => {
  const loaded = parse(TEXT.split("---\n")[1] ?? "") as Record<string, unknown>;
  const input = edit(formInput(testRecord, loaded));
  const values = Result.getOrThrow(
    testRecord.parse(editedValues(testRecord, input, draftValues(testRecord, input), loaded)),
  );
  return Result.getOrThrow(
    updateNoteText(TEXT, editChange(testRecord, loaded, values), (yaml) => parse(yaml)),
  );
};

describe("saving one field of a record with every field kind (PBI-71)", () => {
  it("keeps the bytes of every field the user did not touch", () => {
    const updated = saved((input) => ({ ...input, title: "Akte 2" }));
    expect(updated.text).toBe(TEXT.replace("title: Akte 1", "title: Akte 2"));
  });

  it.each([
    ["due", { due: "2026-12-01" }, "due: 2026-12-01 # Frist"],
    ["count", { count: 6 }, "count: 6"],
    ["done", { done: false }, "done: false"],
    ["tags", { tags: ["rot"] }, "tags:\n  - rot"],
    ["item_id", { item_id: "" }, undefined],
    ["item_ids", { item_ids: [OTHER_ID] }, `item_ids:\n  - ${OTHER_ID}`],
  ] as const)("changes only %s when the user changes it", (key, change, line) => {
    const updated = saved((input) => ({ ...input, ...change }));
    const lines = TEXT.split("\n");
    const start = lines.findIndex((candidate) => candidate.startsWith(`${key}:`));
    const end = lines.findIndex((candidate, index) => index > start && !candidate.startsWith(" "));
    const before = lines.slice(start, end).join("\n");
    const expected =
      line === undefined ? TEXT.replace(`${before}\n`, "") : TEXT.replace(before, line);
    expect(updated.text).toBe(expected);
  });
});
