import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import {
  array,
  constantFrom,
  oneof,
  property,
  assert as fcAssert,
  string,
  tuple,
  type Arbitrary,
} from "fast-check";
import { reportDefect } from "../../../src/application/defects";
import { buildDiagnostics } from "../../../src/application/diagnostics";
import { SettingsServiceLive } from "../../../src/application/settings-service";
import {
  inMemoryStore,
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testHostInfo,
  testMessages,
} from "../../support/layers";

/** Runs `report` for a defect and returns the diagnostics text a user would paste. */
const reportFor = (cause: unknown): string => {
  const logger = recordingLogger();
  const notifier = recordingNotifier();
  const layer = Layer.mergeAll(
    SettingsServiceLive.pipe(
      Layer.provide(Layer.mergeAll(inMemoryStore().layer, notifier.layer, testMessages)),
    ),
    logger.layer,
    notifier.layer,
    sequentialIncidents(),
    testHostInfo,
    testMessages,
  );
  return Effect.runSync(
    Effect.gen(function* () {
      yield* reportDefect(cause);
      return yield* buildDiagnostics;
    }).pipe(Effect.provide(layer)),
  );
};

/** Starts with a marker that no label of the report contains, so a leak cannot match by chance. */
const MARK = "Zq§";

const thrown = (): unknown => {
  try {
    const missing = undefined as unknown as { value: number };
    return missing.value;
  } catch (error) {
    return error;
  }
};

describe("the diagnostics report for a defect", () => {
  it("names the error and at least one frame instead of redacting the cause", () => {
    const cause = thrown();
    assert.instanceOf(cause, TypeError);
    const report = reportFor(cause);
    assert.match(report, /ERROR defect\.reported \(T-1\) TypeError\n {4}\S/);
    assert.notInclude(report, "[redacted]");
    assert.notInclude(report, cause.message);
  });

  it("names a thrown string as NonError and never prints it", () => {
    const report = reportFor("File already exists: Ahornweg/Punkt 12.md");
    assert.include(report, "ERROR defect.reported (T-1) NonError");
    assert.notInclude(report, "Ahornweg");
    assert.notInclude(report, "Punkt");
    assert.notInclude(report, "[redacted]");
  });

  it("does not print the message of an Error without a stack", () => {
    const error = new Error("File already exists: Ahornweg/Punkt 12.md");
    error.stack = "";
    const report = reportFor(error);
    assert.include(report, "ERROR defect.reported (T-1) Error");
    assert.notInclude(report, "Ahornweg");
  });
});

const SEGMENT_CHARACTERS = [..."abcxyzABCÄÖÜäöüß0129 -_.()?#@:'"];
const segment: Arbitrary<string> = array(constantFrom(...SEGMENT_CHARACTERS), {
  minLength: 1,
  maxLength: 12,
}).map((characters) => `Zq${characters.join("")}`);

const directories = array(segment, { minLength: 1, maxLength: 5 });

const windowsPath = tuple(directories, constantFrom("C:", "D:", "\\\\server")).map(
  ([parts, drive]) => `${drive}\\${parts.join("\\")}\\main.js`,
);
const posixPath = directories.map((parts) => `/${parts.join("/")}/main.js`);
const location: Arbitrary<string> = oneof(windowsPath, posixPath);

const frameLine = (path: string, shape: number): string => {
  switch (shape) {
    case 0:
      return `    at run (${path}:10:5)`;
    case 1:
      return `    at ${path}:10:5`;
    case 2:
      return `run@${path}:10:5`;
    default:
      return `@${path}:10:5`;
  }
};

describe("the diagnostics report never leaks", () => {
  it("a directory of any location in a stack", () => {
    fcAssert(
      property(
        array(tuple(location, constantFrom(0, 1, 2, 3)), { minLength: 1, maxLength: 4 }),
        (frames) => {
          const error = new Error("boom");
          error.stack = [
            "Error: boom",
            ...frames.map(([path, shape]) => frameLine(path, shape)),
          ].join("\n");
          const report = reportFor(error);
          assert.notInclude(report, "Zq");
          assert.include(report, "main.js:10:5");
        },
      ),
    );
  });

  it("the message of an Error, however it is shaped", () => {
    fcAssert(
      property(
        array(
          oneof(string(), constantFrom("\n", "    at Zq (Zq.md:1:2)", "Zq@Zq.md:1:2", "(", ")")),
          { maxLength: 6 },
        ),
        (parts) => {
          const message = `${MARK}${parts.join("")}`;
          const error = new Error(message);
          error.stack = `Error: ${message}\n    at real (main.js:5:6)`;
          const report = reportFor(error);
          assert.notInclude(report, MARK);
          assert.include(report, "real (main.js:5:6)");
        },
      ),
    );
  });

  it("the message of an Error without a stack", () => {
    fcAssert(
      property(string(), (text) => {
        const error = new Error(`${MARK}${text}`);
        error.stack = "";
        assert.notInclude(reportFor(error), MARK);
      }),
    );
  });

  it("the text of a cause that is not an Error", () => {
    fcAssert(
      property(string(), (text) => {
        const marked = `${MARK}${text}`;
        const causes: unknown[] = [
          marked,
          { toString: () => marked },
          [marked],
          { message: marked, stack: marked },
        ];
        for (const cause of causes) assert.notInclude(reportFor(cause), MARK);
      }),
    );
  });
});
