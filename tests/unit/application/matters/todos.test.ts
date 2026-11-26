import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  InvalidTodoError,
  completeTodo,
  createTodo,
  todoList,
  updateTodo,
} from "../../../../src/application/matters";
import {
  AW,
  FOLDER,
  TODO_FOLDER,
  matterId,
  matterNote,
  mattersFixture,
  ready,
  stored,
  todoNote,
} from "../../../support/matters/fixture";

const TG = "community-00000000-0000-4000-8000-000000000066";

/** A form input: every field as text, blank by default. */
const input = (extra: Partial<Record<string, string>> = {}) => ({
  title: "Rechnung prüfen",
  community_id: AW,
  matter_id: "",
  responsible: "board",
  status: "open",
  due_on: "",
  follow_up_on: "",
  reason: "",
  ...extra,
});

const byTitle = (title: string) =>
  Effect.map(todoList, ({ records }) => {
    const found = records.find((todo) => todo.values.title === title);
    if (found === undefined) throw new Error(`no to-do ${title}`);
    return found;
  });

describe("to-dos (PBI-10)", () => {
  it.effect("creates a to-do named by its title in To-dos, with its matter", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/A.md`, matterNote(5), "");
    return Effect.gen(function* () {
      yield* ready;
      yield* createTodo(input({ matter_id: matterId(5), due_on: "2026-12-01" }));
      const note = (yield* stored(`${TODO_FOLDER}/Rechnung prüfen.md`)).frontmatter;
      assert.deepStrictEqual(
        [note["schema"], note["matter_id"], note["status"], note["due_on"]],
        ["weg-manager.todo/v1", matterId(5), "open", "2026-12-01"],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses a matter of another community, and waiting without a reason", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/A.md`, matterNote(5, { community_id: TG }), "");
    return Effect.gen(function* () {
      yield* ready;
      const other = yield* Effect.flip(createTodo(input({ matter_id: matterId(5) })));
      assert.instanceOf(other, InvalidTodoError);
      assert.deepStrictEqual(other.issues, [{ key: "matter_id", code: "matter.other-community" }]);
      const waiting = yield* Effect.flip(createTodo(input({ status: "waiting" })));
      assert.instanceOf(waiting, InvalidTodoError);
      assert.deepStrictEqual(
        waiting.issues.map((issue) => issue.code),
        ["follow-up.missing", "reason.missing"],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("completes a to-do and leaves its matter as it was (criterion 3)", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/A.md`, matterNote(5), "");
    fixture.memory.seed(
      `${TODO_FOLDER}/Angebot versenden.md`,
      todoNote(1, "Angebot versenden", { matter_id: matterId(5) }),
    );
    return Effect.gen(function* () {
      yield* ready;
      yield* completeTodo(yield* byTitle("Angebot versenden"));
      const todo = (yield* stored(`${TODO_FOLDER}/Angebot versenden.md`)).frontmatter;
      const matter = (yield* stored(`${FOLDER}/A.md`)).frontmatter;
      assert.deepStrictEqual([todo["status"], matter["status"]], ["done", "open"]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("saves a waiting to-do with its reason and follow-up date", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${TODO_FOLDER}/Angebot.md`, todoNote(1, "Angebot"));
    return Effect.gen(function* () {
      yield* ready;
      const todo = yield* byTitle("Angebot");
      yield* updateTodo(
        todo,
        input({
          title: "Angebot",
          status: "waiting",
          reason: "Firma rechnet",
          follow_up_on: "2026-12-03",
        }),
      );
      const note = (yield* stored(`${TODO_FOLDER}/Angebot.md`)).frontmatter;
      assert.deepStrictEqual(
        [note["status"], note["reason"], note["follow_up_on"]],
        ["waiting", "Firma rechnet", "2026-12-03"],
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});
