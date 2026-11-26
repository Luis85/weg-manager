import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  InvalidMatterError,
  createMatter,
  matterList,
  updateMatter,
} from "../../../../src/application/matters";
import type { MatterInput } from "../../../../src/domain/matters";
import {
  AW,
  FOLDER,
  MANAGER,
  matterId,
  matterNote,
  mattersFixture,
  ready,
  stored,
} from "../../../support/matters/fixture";

const INPUT: MatterInput = {
  number: undefined,
  community_id: AW,
  kind: "manager_promise",
  topic: "Beleuchtung",
  outcome: "Die Lampe ist ersetzt.",
  responsible_id: MANAGER,
  promised_on: "",
  due_on: "2026-11-30",
  due_kind: "",
  due_source: "",
  due_checked: "",
  follow_up_on: "",
  status: "open",
  done_on: "",
  source: "Mail",
  next_step: "Nachfragen.",
  message_ref: "",
  link: "",
};

describe("createMatter", () => {
  it.effect("writes the note named by its outcome, with the next number over all matters", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/A.md`, matterNote(40));
    fixture.memory.seed(
      `${FOLDER}/B.md`,
      matterNote(7, { community_id: "community-00000000-0000-4000-8000-000000000999" }),
    );
    return Effect.gen(function* () {
      yield* ready;
      const note = yield* createMatter({ ...INPUT, number: 3 });
      assert.strictEqual(note.path, `${FOLDER}/Die Lampe ist ersetzt.md`);
      assert.deepStrictEqual(Object.entries((yield* stored(note.path)).frontmatter), [
        ["schema", "weg-manager.matter/v1"],
        ["id", matterId(1)],
        ["number", 41],
        ["community_id", AW],
        ["kind", "manager_promise"],
        ["topic", "Beleuchtung"],
        ["outcome", "Die Lampe ist ersetzt."],
        ["responsible_id", MANAGER],
        ["due_on", "2026-11-30"],
        ["status", "open"],
        ["source", "Mail"],
        ["next_step", "Nachfragen."],
      ]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses broken input with every issue and writes nothing", () => {
    const fixture = mattersFixture();
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(createMatter({ ...INPUT, topic: "", status: "done" }));
      assert.deepStrictEqual(
        error,
        new InvalidMatterError({
          issues: [
            { key: "topic", code: "field.missing" },
            { key: "done_on", code: "done-on.missing" },
          ],
        }),
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("matterList", () => {
  it.effect("marks numbers two matters share, on both", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/A.md`, matterNote(5, { id: matterId(1) }));
    fixture.memory.seed(`${FOLDER}/B.md`, matterNote(5, { id: matterId(2), outcome: "Zweites" }));
    fixture.memory.seed(`${FOLDER}/C.md`, matterNote(6, { id: matterId(3), outcome: "Drittes" }));
    return Effect.gen(function* () {
      yield* ready;
      const { records } = yield* matterList;
      assert.deepStrictEqual(
        records.map((matter) => [matter.values.number, matter.issues.map((issue) => issue.code)]),
        [
          [6, []],
          [5, ["number.duplicate"]],
          [5, ["number.duplicate"]],
        ],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("names a responsible contact that is gone as a missing reference", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(
      `${FOLDER}/A.md`,
      matterNote(1, { responsible_id: "contact-00000000-0000-4000-8000-000000000999" }),
    );
    return Effect.gen(function* () {
      yield* ready;
      const { records } = yield* matterList;
      assert.deepStrictEqual(
        records[0]?.issues.map((issue) => [issue.code, "key" in issue ? issue.key : ""]),
        [["reference.missing", "responsible_id"]],
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("updateMatter", () => {
  it.effect("refuses a number another matter has, and saves a new one with a status change", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/A.md`, matterNote(5, { id: matterId(1), outcome: "A" }));
    fixture.memory.seed(`${FOLDER}/B.md`, matterNote(5, { id: matterId(2), outcome: "B" }));
    fixture.memory.seed(`${FOLDER}/C.md`, matterNote(6, { id: matterId(3), outcome: "C" }));
    return Effect.gen(function* () {
      yield* ready;
      const { records } = yield* matterList;
      const first = records.find((matter) => matter.values.outcome === "A");
      if (first === undefined) throw new Error("no matter A");
      const taken = yield* Effect.flip(
        updateMatter(first, {
          ...INPUT,
          number: 6,
          outcome: "A",
          status: "done",
          done_on: "2026-12-01",
        }),
      );
      assert.deepStrictEqual(
        taken,
        new InvalidMatterError({ issues: [{ key: "number", code: "number.taken" }] }),
      );
      yield* updateMatter(first, {
        ...INPUT,
        number: 7,
        outcome: "A",
        status: "done",
        done_on: "2026-12-01",
      });
      const written = (yield* stored(`${FOLDER}/A.md`)).frontmatter;
      assert.deepStrictEqual(
        [written["number"], written["status"], written["done_on"]],
        [7, "done", "2026-12-01"],
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});
