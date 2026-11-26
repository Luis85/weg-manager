import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  InvalidSourceError,
  captureSource,
  plannedPaths,
  sourceFiles,
  sourceList,
} from "../../../../src/application/matters";
import { LocalFileRemoveError } from "../../../../src/application/notes";
import {
  AW,
  FOLDER,
  matterId,
  matterNote,
  mattersFixture,
  indexed,
  ready,
  stored,
} from "../../../support/matters/fixture";

const TG = "community-00000000-0000-4000-8000-000000000066";
const SOURCES = "WEG Manager/Quellen";

const input = (extra: Partial<Record<string, unknown>> = {}) =>
  ({
    subject: "Angebot Beleuchtung",
    kind: "mail",
    community_id: AW,
    matter_ids: [matterId(5)],
    received_on: "2026-11-20",
    origin: "Mail der Verwaltung",
    message_ref: "",
    link: "",
    files: [],
    ...extra,
  }) as never;

const picked = (name: string, handle: unknown = undefined) => ({
  name,
  bytes: new Uint8Array([1, 2, 3]),
  handle,
});

describe("captureSource (PBI-11)", () => {
  it.effect("copies the originals by the filing rule and writes the note with its text", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/A.md`, matterNote(5), "");
    fixture.files.seed(`${SOURCES}/AW/2026-11-20 Mail Angebot Beleuchtung.pdf`);
    return Effect.gen(function* () {
      yield* ready;
      const files = [picked("scan.PDF"), picked("scan2.pdf"), picked("foto.jpg")];
      const filing = {
        community_id: AW,
        kind: "mail",
        subject: "Angebot Beleuchtung",
        received_on: "2026-11-20",
      } as const;
      const planned = yield* plannedPaths(filing, files);
      assert.deepStrictEqual(planned, [
        `${SOURCES}/AW/2026-11-20 Mail Angebot Beleuchtung (2).pdf`,
        `${SOURCES}/AW/2026-11-20 Mail Angebot Beleuchtung (3).pdf`,
        `${SOURCES}/AW/2026-11-20 Mail Angebot Beleuchtung.jpg`,
      ]);
      const note = yield* captureSource({
        input: input(),
        text: "Sehr geehrter Beirat,\nanbei das Angebot.",
        files,
        move: false,
      });
      assert.strictEqual(note.path, `${SOURCES}/Angebot Beleuchtung.md`);
      const frontmatter = (yield* stored(note.path)).frontmatter;
      assert.deepStrictEqual(
        frontmatter["files"],
        planned.map((path) => `[[${path}]]`),
      );
      assert.deepStrictEqual(frontmatter["matter_ids"], [matterId(5)]);
      assert.strictEqual(
        fixture.memory.body(note.path),
        "Sehr geehrter Beirat,\nanbei das Angebot.\n",
      );
      assert.deepStrictEqual(
        fixture.files.bytes(`${SOURCES}/AW/2026-11-20 Mail Angebot Beleuchtung.pdf`),
        new Uint8Array([1]),
      );
      assert.deepStrictEqual(fixture.local.removed(), []);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("moves the originals: removes each outside once the source is written", () => {
    const fixture = mattersFixture();
    return Effect.gen(function* () {
      yield* ready;
      yield* captureSource({
        input: input({ matter_ids: [] }),
        text: "",
        files: [picked("a.png", "/home/beirat/a.png")],
        move: true,
      });
      assert.deepStrictEqual(fixture.local.removed(), ["/home/beirat/a.png"]);
      assert.include(
        fixture.files.paths(),
        `${SOURCES}/AW/2026-11-20 Mail Angebot Beleuchtung.png`,
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps the source and its copies when the original cannot be removed", () => {
    const fixture = mattersFixture();
    fixture.local.setFailing(true);
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        captureSource({
          input: input({ matter_ids: [] }),
          text: "",
          files: [picked("a.png", "/home/beirat/a.png")],
          move: true,
        }),
      );
      assert.instanceOf(error, LocalFileRemoveError);
      assert.lengthOf(fixture.files.paths(), 1);
      yield* indexed;
      const { records } = yield* sourceList;
      assert.lengthOf(records, 1);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("refuses a matter of another community and writes nothing", () => {
    const fixture = mattersFixture();
    fixture.memory.seed(`${FOLDER}/A.md`, matterNote(5, { community_id: TG }), "");
    return Effect.gen(function* () {
      yield* ready;
      const error = yield* Effect.flip(
        captureSource({ input: input(), text: "", files: [picked("a.pdf")], move: false }),
      );
      assert.instanceOf(error, InvalidSourceError);
      assert.deepStrictEqual(fixture.files.paths(), []);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("shows an original that is gone as missing, and an image by its address", () => {
    const fixture = mattersFixture();
    return Effect.gen(function* () {
      yield* ready;
      yield* captureSource({
        input: input({ matter_ids: [] }),
        text: "",
        files: [picked("a.png"), picked("b.pdf")],
        move: false,
      });
      fixture.files.remove(`${SOURCES}/AW/2026-11-20 Mail Angebot Beleuchtung.pdf`);
      yield* indexed;
      const { records } = yield* sourceList;
      const source = records[0];
      if (source === undefined) throw new Error("no source");
      const files = yield* sourceFiles(source);
      assert.deepStrictEqual(
        files.map((file) => [file.name, file.missing, file.image !== undefined]),
        [
          ["2026-11-20 Mail Angebot Beleuchtung.png", false, true],
          ["2026-11-20 Mail Angebot Beleuchtung.pdf", true, false],
        ],
      );
    }).pipe(Effect.provide(fixture.layer));
  });
});
