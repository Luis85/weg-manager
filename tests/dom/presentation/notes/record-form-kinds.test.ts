import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { NoteStore } from "../../../../src/application/notes";
import type { AppRuntime } from "../../../../src/application/app-services";
import { ConflictChoice, useRecordForm } from "../../../../src/presentation/notes";
import { provideRuntime } from "../../../../src/presentation/shell/runtime/use-runtime";
import { host, runtimes } from "../../../support/composable";
import { FULL, OTHER_ID, TEST_ID, testItem } from "../../../support/notes/test-note-type";
import {
  createTestRecord,
  testItems,
  testRecords,
  updateTestRecord,
  type TestRecordRow,
} from "../../../support/notes/test-record-form";
import { recordNote, testRecord } from "../../../support/notes/test-record-type";
import { eventually } from "../../../support/wait";

// The record form kit on a test type with every field kind (PBI-71): what a save writes of the
// fields the user did not touch, the conflict choice for lists and references, and a reference to
// a record that is gone. No product type has such fields yet; communities are text only.

const { make, disposeAll } = runtimes();
afterEach(disposeAll);

const FOLDER = "WEG Manager/Akten";
const PATH = `${FOLDER}/Akte 1.md`;
const LABELS = {
  title: "Titel",
  due: "Frist",
  count: "Anzahl",
  done: "Erledigt",
  tags: "Schlagworte",
  item_id: "Eintrag",
  item_ids: "Einträge",
};

const read = (runtime: AppRuntime, path: string) =>
  runtime.runPromise(NoteStore.use((store) => store.read(path)));
const frontmatters = (runtime: AppRuntime) =>
  runtime
    .runPromise(NoteStore.use((store) => store.list))
    .then((notes) => notes.filter((note) => note.path.startsWith(FOLDER)));

/** The app over the test types with a test item and the record `frontmatter` (none: no record), the index built. */
const opened = async (frontmatter: Record<string, unknown> | null = recordNote()) => {
  const test = make({ noteTypes: [testItem, testRecord] });
  test.notes.seed("WEG Manager/Einträge/Ahornweg 12.md", FULL);
  if (frontmatter !== null) test.notes.seed(PATH, frontmatter, "Notizen\n");
  await test.vaultReady();
  const rows = await eventually(async () => {
    const list = await test.runtime.runPromise(testRecords.list);
    expect(list.ready).toBe(true);
    return list.records;
  });
  return { ...test, row: rows[0] };
};

/** The record form of `row` (none creates one); `done` records the ids saved. */
const formOf = (runtime: AppRuntime, row: TestRecordRow | undefined) => {
  const saved: string[] = [];
  const { exposed } = host(runtime, () =>
    useRecordForm({
      type: testRecord,
      record: row,
      create: createTestRecord,
      update: updateTestRecord,
      invalid: "InvalidCommunityError",
      rules: () => [],
      describe: (issue) => issue.code,
      labels: LABELS,
      references: { item_id: testItems, item_ids: testItems },
      summary: { title: "", detail: "" },
      root: () => undefined,
      done: (id) => saved.push(id),
    }),
  );
  return { ...exposed, saved };
};

describe("a record form with every field kind", () => {
  it("loads each field in the form of its kind", async () => {
    const { runtime, row } = await opened();
    const form = formOf(runtime, row);
    expect(form.form.state.values).toEqual({
      title: "Akte 1",
      due: "2026-11-22",
      count: 5,
      done: true,
      tags: ["rot", "grün"],
      item_id: TEST_ID,
      item_ids: [TEST_ID, OTHER_ID],
    });
  });

  it("keeps every field the user did not touch when another one is saved", async () => {
    const { runtime, row } = await opened();
    const form = formOf(runtime, row);
    form.form.setFieldValue("title", "Akte 2");
    await form.submit();
    await eventually(() => expect(form.saved).toEqual([recordNote().id]));
    expect((await read(runtime, `${FOLDER}/Akte 2.md`)).frontmatter).toEqual(
      recordNote({ title: "Akte 2" }),
    );
  });

  it("writes numbers, flags and lists as their kind, not as text", async () => {
    const { runtime } = await opened(null);
    const form = formOf(runtime, undefined);
    form.form.setFieldValue("title", "Akte 3");
    form.form.setFieldValue("count", 0);
    form.form.setFieldValue("done", false);
    form.form.setFieldValue("tags", [" rot ", ""]);
    form.form.setFieldValue("item_ids", [TEST_ID]);
    await form.submit();
    await eventually(() => expect(form.saved).toHaveLength(1));
    const [note] = await frontmatters(runtime);
    expect(note?.frontmatter).toEqual({
      schema: "weg-manager.test-record/v1",
      id: form.saved[0],
      title: "Akte 3",
      count: 0,
      done: false,
      tags: ["rot"],
      item_ids: [TEST_ID],
    });
  });

  it("shows lists and references with their values in the conflict, and theirs sets the form", async () => {
    const { runtime, row, notes } = await opened();
    const form = formOf(runtime, row);
    notes.seed(PATH, recordNote({ tags: ["blau"], item_ids: [TEST_ID] }), "Notizen\n");
    form.form.setFieldValue("tags", ["rot"]);
    form.form.setFieldValue("item_ids", []);
    await form.submit();
    await eventually(() =>
      expect(form.conflicts.value?.map((c) => c.key)).toEqual(["tags", "item_ids"]),
    );
    const choice = mount(ConflictChoice, {
      props: {
        conflicts: form.conflicts.value ?? [],
        disabled: false,
        label: form.label,
        show: form.show,
      },
      global: { plugins: [{ install: (app) => provideRuntime(app, runtime) }] },
    });
    const t = de.notes.conflict;
    const tags = choice.get("[data-testid=conflict-tags]").text();
    expect(tags).toContain(t.loaded("rot, grün"));
    expect(tags).toContain(t.mine("rot"));
    expect(tags).toContain(t.theirs("blau"));
    const items = choice.get("[data-testid=conflict-item_ids]").text();
    expect(items).toContain(t.loaded(`Ahornweg 12, ${OTHER_ID}`));
    expect(items).toContain(t.mine(t.empty));
    expect(items).toContain(t.theirs("Ahornweg 12"));
    choice.unmount();
    form.resolve({ tags: "theirs", item_ids: "theirs" });
    expect(form.form.state.values.tags).toEqual(["blau"]);
    expect(form.form.state.values.item_ids).toEqual([TEST_ID]);
    await eventually(() => expect(form.saved).toHaveLength(1));
    await flushPromises();
  });

  it("saves a record whose references name a record that is gone, and marks the field", async () => {
    const gone = "test-item-00000000-0000-4000-8000-0000000000ff";
    const { runtime, row } = await opened(recordNote({ item_id: gone, item_ids: [gone, TEST_ID] }));
    expect(row?.issues).toEqual([
      { code: "reference.missing", key: "item_id", id: gone },
      { code: "reference.missing", key: "item_ids", id: gone },
    ]);
    const form = formOf(runtime, row);
    const pristine = { errors: [], isDirty: false };
    expect(form.errorOf("item_id", pristine)).toBe("reference.missing");
    expect(form.errorOf("item_ids", pristine)).toBe("reference.missing");
    form.form.setFieldValue("title", "Akte 2");
    await form.submit();
    await eventually(() => expect(form.saved).toHaveLength(1));
    expect((await read(runtime, `${FOLDER}/Akte 2.md`)).frontmatter).toEqual(
      recordNote({ title: "Akte 2", item_id: gone, item_ids: [gone, TEST_ID] }),
    );
  });
});
