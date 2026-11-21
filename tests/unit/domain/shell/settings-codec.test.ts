import { Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
  makeSettingsCodec,
  type Migrations,
  type SettingsFields,
} from "../../../../src/domain/shell/settings-codec";

/** A test-only declaration at version 3, so the migration mechanism runs without production settings. */
type Test = { readonly name: string; readonly count: number; readonly note: string | null };

type TestIssue = { readonly code: "greeting.length"; readonly max: number };

const fields: SettingsFields<Test, TestIssue> = {
  name: {
    schema: Schema.Trim.check(Schema.isNonEmpty()),
    default: "none",
    issue: { code: "greeting.length", max: 1 },
    omitWhenDefault: false,
  },
  count: {
    schema: Schema.Int,
    default: 0,
    issue: { code: "greeting.length", max: 2 },
    omitWhenDefault: true,
  },
  note: {
    schema: Schema.NullOr(Schema.String),
    default: null,
    issue: { code: "greeting.length", max: 3 },
    omitWhenDefault: true,
  },
};

const record = (raw: Record<string, unknown>) => raw;

/** Records which steps ran, in order, and with what. */
const recordingMigrations = () => {
  const calls: Array<{ readonly from: number; readonly input: Record<string, unknown> }> = [];
  const migrations: Migrations = {
    1: (raw) => {
      calls.push({ from: 1, input: raw });
      const { title, ...rest } = raw;
      return { ...rest, name: title };
    },
    2: (raw) => {
      calls.push({ from: 2, input: raw });
      return { ...raw, count: Number(raw["count"]) };
    },
  };
  return { calls, migrations };
};

const setup = (migrations: Migrations = recordingMigrations().migrations) =>
  makeSettingsCodec({ version: 3, fields, migrations });

describe("makeSettingsCodec", () => {
  it("builds the defaults from the declaration at the given version", () => {
    expect(setup().defaults).toEqual({ schemaVersion: 3, name: "none", count: 0, note: null });
  });

  it("reads a current file field by field and drops unknown keys", () => {
    const result = setup().decode({ schemaVersion: 3, name: " Anna ", count: 4, extra: 1 });
    expect(result).toEqual({
      settings: { schemaVersion: 3, name: "Anna", count: 4, note: null },
      issues: [],
      writable: true,
    });
  });

  it("falls back for each invalid field alone and reports its own issue", () => {
    const result = setup().decode({ schemaVersion: 3, name: "", count: 1.5, note: "ok" });
    expect(result.settings).toEqual({ schemaVersion: 3, name: "none", count: 0, note: "ok" });
    expect(result.issues).toEqual([
      { code: "greeting.length", max: 1 },
      { code: "greeting.length", max: 2 },
    ]);
  });

  it("treats a missing or null file as a first run, and a non-object as invalid", () => {
    const codec = setup();
    for (const raw of [undefined, null]) {
      expect(codec.decode(raw)).toEqual({ settings: codec.defaults, issues: [], writable: true });
    }
    for (const raw of ["x", 3, true, []]) {
      expect(codec.decode(raw)).toEqual({
        settings: codec.defaults,
        issues: [{ code: "file.invalid" }],
        writable: true,
      });
    }
  });

  it("reads a file written by a newer version as defaults and read-only, running no step", () => {
    const { calls, migrations } = recordingMigrations();
    const result = setup(migrations).decode({ schemaVersion: 4, name: "Anna" });
    expect(result).toEqual({
      settings: { schemaVersion: 3, name: "none", count: 0, note: null },
      issues: [{ code: "schema.newer", version: 4 }],
      writable: false,
      readOnlyReason: "newer-version",
    });
    expect(calls).toEqual([]);
  });

  it("treats a missing version as current and runs no step", () => {
    const { calls, migrations } = recordingMigrations();
    const result = setup(migrations).decode({ name: "Anna", count: 2 });
    expect(result.settings).toEqual({ schemaVersion: 3, name: "Anna", count: 2, note: null });
    expect(result.issues).toEqual([]);
    expect(calls).toEqual([]);
  });

  it.each(["1", 0, -1, 1.5, null])(
    "reports schema.invalid for the version %j, keeps decoding and runs no step",
    (schemaVersion) => {
      const { calls, migrations } = recordingMigrations();
      const result = setup(migrations).decode({ schemaVersion, name: "Anna" });
      expect(result.settings.name).toBe("Anna");
      expect(result.issues).toEqual([{ code: "schema.invalid" }]);
      expect(result.writable).toBe(true);
      expect(calls).toEqual([]);
    },
  );
});

describe("migrations", () => {
  it("lift a version 1 file through every step in order", () => {
    const { calls, migrations } = recordingMigrations();
    const result = setup(migrations).decode({ schemaVersion: 1, title: " Anna ", count: "7" });
    expect(result).toEqual({
      settings: { schemaVersion: 3, name: "Anna", count: 7, note: null },
      issues: [],
      writable: true,
    });
    expect(calls).toEqual([
      { from: 1, input: { schemaVersion: 1, title: " Anna ", count: "7" } },
      { from: 2, input: { schemaVersion: 1, name: " Anna ", count: "7" } },
    ]);
  });

  it("start at the file's own version", () => {
    const { calls, migrations } = recordingMigrations();
    const result = setup(migrations).decode({ schemaVersion: 2, name: "Berta", count: "5" });
    expect(result.settings).toEqual({ schemaVersion: 3, name: "Berta", count: 5, note: null });
    expect(calls.map((call) => call.from)).toEqual([2]);
  });

  it("do not run for a current file", () => {
    const { calls, migrations } = recordingMigrations();
    setup(migrations).decode({ schemaVersion: 3, name: "Anna" });
    expect(calls).toEqual([]);
  });

  it("run before the field decode, so a migrated value still falls back on its own", () => {
    const result = setup().decode({ schemaVersion: 2, name: "Anna", count: "x" });
    expect(result.settings).toEqual({ schemaVersion: 3, name: "Anna", count: 0, note: null });
    expect(result.issues).toEqual([{ code: "greeting.length", max: 2 }]);
  });

  it("treat a version without a step as needing no change", () => {
    const calls: number[] = [];
    const codec = setup({
      2: (raw) => {
        calls.push(2);
        return raw;
      },
    });
    const result = codec.decode({ schemaVersion: 1, name: "Anna" });
    expect(result.settings).toEqual({ schemaVersion: 3, name: "Anna", count: 0, note: null });
    expect(result.issues).toEqual([]);
    expect(calls).toEqual([2]);
  });

  it("ignore steps at or above the current version", () => {
    const calls: number[] = [];
    const codec = setup({
      3: (raw) => {
        calls.push(3);
        return raw;
      },
    });
    codec.decode({ schemaVersion: 3, name: "Anna" });
    expect(calls).toEqual([]);
  });

  it("run in memory only: the file content is untouched and the next save writes the new version", () => {
    const codec = setup();
    const file = Object.freeze({ schemaVersion: 1, title: "Anna", count: "7" });
    const { settings } = codec.decode(file);
    expect(file).toEqual({ schemaVersion: 1, title: "Anna", count: "7" });
    expect(codec.encode(settings)).toEqual({ schemaVersion: 3, name: "Anna", count: 7 });
  });

  it.each([
    ["throws an error", () => failWith(new Error("boom"))],
    ["throws a non-error", () => failWith("boom")],
    ["returns null", () => null],
    ["returns undefined", () => undefined],
    ["returns an array", () => []],
    ["returns a string", () => "x"],
  ])(
    "fail safely when a step %s: defaults, migration.failed and a read-only file",
    (_label, step) => {
      const codec = setup({ 1: record, 2: step });
      const result = codec.decode({ schemaVersion: 1, name: "Anna", count: 5 });
      expect(result).toEqual({
        settings: codec.defaults,
        issues: [{ code: "migration.failed", from: 2 }],
        writable: false,
        readOnlyReason: "unreadable",
      });
    },
  );

  it("name the step that failed, and run no later one", () => {
    const calls: number[] = [];
    const codec = setup({
      1: () => failWith(new Error("first")),
      2: (raw) => {
        calls.push(2);
        return raw;
      },
    });
    expect(codec.decode({ schemaVersion: 1 }).issues).toEqual([
      { code: "migration.failed", from: 1 },
    ]);
    expect(calls).toEqual([]);
  });
});

describe("encode and validatePatch of a codec", () => {
  it("writes the version, always-written fields and only non-default optional ones, in order", () => {
    const codec = setup();
    expect(Object.keys(codec.encode(codec.defaults))).toEqual(["schemaVersion", "name"]);
    expect(codec.encode({ schemaVersion: 3, name: "A", count: 2, note: "n" })).toEqual({
      schemaVersion: 3,
      name: "A",
      count: 2,
      note: "n",
    });
    expect(Object.keys(codec.encode({ schemaVersion: 3, name: "A", count: 2, note: "n" }))).toEqual(
      ["schemaVersion", "name", "count", "note"],
    );
  });

  it("applies a patch all-or-nothing with the same issues as decode", () => {
    const codec = setup();
    const current = { ...codec.defaults, name: "Anna", count: 1 };
    expect(codec.validatePatch(current, { count: 9 })).toEqual({
      ok: true,
      settings: { ...current, count: 9 },
    });
    expect(codec.validatePatch(current, { name: "Berta", count: 1.5 })).toEqual({
      ok: false,
      issues: [{ code: "greeting.length", max: 2 }],
    });
  });

  it("keeps the codec's version whatever the patch says", () => {
    const codec = setup();
    const patch = { schemaVersion: 9, name: "Z" } as Partial<Test>;
    expect(codec.validatePatch(codec.defaults, patch)).toEqual({
      ok: true,
      settings: { ...codec.defaults, name: "Z" },
    });
  });
});

/** A step may throw anything, not only an `Error`. */
function failWith(error: unknown): never {
  throw error;
}
