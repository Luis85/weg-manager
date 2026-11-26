import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  InvalidHistoryEntryError,
  InvalidDueChangeError,
  InvalidStatusChangeError,
  addHistoryEntry,
  changeDue,
  changeStatus,
  matterHistory,
  matterList,
} from "../../../../src/application/matters";
import { HISTORY_HEADING } from "../../../../src/domain/matters";
import {
  FOLDER,
  matterNote,
  mattersFixture,
  ready,
  stored,
} from "../../../support/matters/fixture";

const PATH = `${FOLDER}/A.md`;
const first = Effect.map(matterList, ({ records }) => {
  const [matter] = records;
  if (matter === undefined) throw new Error("no matter");
  return matter;
});

describe("matterHistory and addHistoryEntry", () => {
  it.effect("adds an entry to the section, recorded today, and reads it back", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(PATH, matterNote(5), "Eigene Notiz\n");
    return Effect.gen(function* () {
      yield* ready;
      const matter = yield* first;
      assert.deepStrictEqual(yield* matterHistory(matter), []);
      yield* addHistoryEntry(matter, {
        kind: "request",
        text: "Anfrage per Mail",
        occurred_on: "2026-11-20",
        actor: "board",
        source: "Mail",
      });
      const body = fixture.memory.body(PATH) ?? "";
      assert.isTrue(
        body.startsWith(
          `Eigene Notiz\n\n${HISTORY_HEADING}\n\n- 2026-11-20 Anfrage per Mail [kind:: request]`,
        ),
      );
      assert.deepStrictEqual(
        (yield* matterHistory(matter)).map((line) =>
          line.kind === "entry" ? [line.entry.text, line.entry.recorded_on] : [],
        ),
        [["Anfrage per Mail", "2026-11-26"]],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses an entry without text and writes nothing", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(PATH, matterNote(5), "");
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        addHistoryEntry(yield* first, {
          kind: "note",
          text: " ",
          occurred_on: "",
          actor: "board",
          source: "",
        }),
      );
      assert.deepStrictEqual(error, new InvalidHistoryEntryError({ issues: ["text.missing"] }));
      assert.strictEqual(fixture.memory.body(PATH), "");
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("changeStatus", () => {
  it.effect("writes the status, the done day and the entry in one write (PBI-08)", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(PATH, matterNote(5), "");
    return Effect.gen(function* () {
      yield* ready;
      yield* changeStatus(yield* first, {
        to: "done",
        reason: "Lampe ersetzt, Foto per Mail",
        source: "Mail",
        done_on: "2026-11-25",
      });
      const written = (yield* stored(PATH)).frontmatter;
      assert.deepStrictEqual([written["status"], written["done_on"]], ["done", "2026-11-25"]);
      const body = fixture.memory.body(PATH) ?? "";
      assert.include(
        body,
        "- 2026-11-25 Lampe ersetzt, Foto per Mail [kind:: status_change] [actor:: board] [status:: done] [source:: Mail] [recorded:: 2026-11-26]",
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("reopens a done matter with a reason and drops its done day (criterion 3)", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(PATH, matterNote(5, { status: "done", done_on: "2026-11-25" }), "");
    return Effect.gen(function* () {
      yield* ready;
      yield* changeStatus(yield* first, {
        to: "open",
        reason: "Wieder defekt",
        source: "",
        done_on: "",
      });
      const written = (yield* stored(PATH)).frontmatter;
      assert.strictEqual(written["status"], "open");
      assert.isFalse(Object.hasOwn(written, "done_on"));
      assert.include(
        fixture.memory.body(PATH) ?? "",
        "- 2026-11-26 Wieder defekt [kind:: status_change] [actor:: board] [status:: open]",
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses to close a matter without a source and writes nothing", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(PATH, matterNote(5), "");
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        changeStatus(yield* first, { to: "obsolete", reason: "entfällt", source: "", done_on: "" }),
      );
      assert.deepStrictEqual(error, new InvalidStatusChangeError({ issues: ["source.missing"] }));
      assert.strictEqual((yield* stored(PATH)).frontmatter["status"], "open");
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("changeDue (PBI-09)", () => {
  it.effect("writes the new due date with its meaning and the earlier one into the history", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(PATH, matterNote(5, { due_on: "2026-11-30" }), "");
    return Effect.gen(function* () {
      yield* ready;
      yield* changeDue(yield* first, {
        due_on: "2026-12-15",
        due_kind: "promise",
        due_source: "Mail der Verwaltung",
        due_checked: "confirmed",
        reason: "Neue Zusage",
      });
      const written = (yield* stored(PATH)).frontmatter;
      assert.deepStrictEqual(
        [written["due_on"], written["due_kind"], written["due_source"], written["due_checked"]],
        ["2026-12-15", "promise", "Mail der Verwaltung", "confirmed"],
      );
      assert.include(
        fixture.memory.body(PATH) ?? "",
        "- 2026-11-26 Neue Zusage [kind:: new_date] [actor:: board] [previous:: 2026-11-30] [recorded:: 2026-11-26]",
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect(
    "removes the due date and its details when it is cleared, and says there was none before",
    () => {
      const fixture = mattersFixture();
      fixture.memory.seed(PATH, matterNote(5), "");
      return Effect.gen(function* () {
        yield* ready;
        yield* changeDue(yield* first, {
          due_on: "2026-12-01",
          due_kind: "",
          due_source: "",
          due_checked: "",
          reason: "Termin genannt",
        });
        assert.include(fixture.memory.body(PATH) ?? "", "[previous:: none]");
        const again = yield* first;
        yield* changeDue(again, {
          due_on: "",
          due_kind: "",
          due_source: "",
          due_checked: "",
          reason: "Termin zurückgezogen",
        });
        const written = (yield* stored(PATH)).frontmatter;
        assert.isFalse(Object.hasOwn(written, "due_on"));
      }).pipe(Effect.provide(fixture.layer));
    },
  );

  it.effect("refuses a change without a reason and writes nothing", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(PATH, matterNote(5), "");
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        changeDue(yield* first, {
          due_on: "2026-12-01",
          due_kind: "",
          due_source: "",
          due_checked: "",
          reason: "",
        }),
      );
      assert.deepStrictEqual(error, new InvalidDueChangeError({ issues: ["reason.missing"] }));
      assert.strictEqual(fixture.memory.body(PATH), "");
    }).pipe(Effect.provide(fixture.layer));
  });
});
