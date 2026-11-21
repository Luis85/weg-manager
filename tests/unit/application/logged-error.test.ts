import { runInNewContext } from "node:vm";
import { assert, describe, it } from "@effect/vitest";
import { MAX_FRAMES, toLoggedError } from "../../../src/application/logged-error";

const withStack = (stack: string, message = "boom", name?: string): Error => {
  const error = new Error(message);
  if (name !== undefined) error.name = name;
  error.stack = stack;
  return error;
};

const framesOf = (...lines: string[]): readonly string[] =>
  toLoggedError(withStack(["Error: boom", ...lines].join("\n"))).frames;

const thrown = (): unknown => {
  try {
    throw new TypeError("x is undefined");
  } catch (error) {
    return error;
  }
};

describe("toLoggedError name", () => {
  it("keeps the name of an Error that is a plain identifier", () => {
    assert.strictEqual(toLoggedError(new TypeError("x")).name, "TypeError");
    assert.strictEqual(toLoggedError(withStack("", "x", "A")).name, "A");
    assert.strictEqual(
      toLoggedError(withStack("", "x", "Vault.Error$1_b")).name,
      "Vault.Error$1_b",
    );
  });

  it("allows 64 characters and falls back to Error for 65", () => {
    assert.strictEqual(toLoggedError(withStack("", "x", "N".repeat(64))).name, "N".repeat(64));
    assert.strictEqual(toLoggedError(withStack("", "x", "N".repeat(65))).name, "Error");
  });

  it("falls back to Error for a name that is not a strict identifier", () => {
    for (const name of [
      "",
      "1Error",
      "_Error",
      "$Error",
      ".Error",
      "My Error",
      "Error\n",
      "\nError",
      "Fehler: Ahornweg/Punkt 12.md",
      "Größe",
      "Error-1",
    ]) {
      assert.strictEqual(
        toLoggedError(withStack("", "x", name)).name,
        "Error",
        JSON.stringify(name),
      );
    }
  });

  it("falls back to Error when the name is not a string", () => {
    const error = new Error("x");
    Object.defineProperty(error, "name", { value: 42 });
    assert.strictEqual(toLoggedError(error).name, "Error");
    const coercible = new Error("x");
    Object.defineProperty(coercible, "name", { value: { toString: () => "Evil" } });
    assert.strictEqual(toLoggedError(coercible).name, "Error");
  });

  it("names anything that is not an Error NonError", () => {
    for (const cause of ["text", 42, null, undefined, { name: "TypeError" }, ["a"]]) {
      assert.strictEqual(toLoggedError(cause).name, "NonError");
    }
  });

  it("recognises an Error from another realm", () => {
    const foreign: unknown = runInNewContext("new RangeError('far')");
    assert.isFalse(foreign instanceof Error);
    const logged = toLoggedError(foreign);
    assert.strictEqual(logged.name, "RangeError");
    assert.strictEqual(logged.message, "far");
  });
});

describe("toLoggedError message", () => {
  it("keeps the raw message of an Error, unshortened", () => {
    const text = "File already exists: Ahornweg/Punkt 12.md ".repeat(10);
    assert.strictEqual(toLoggedError(new Error(text)).message, text);
    assert.strictEqual(toLoggedError(new Error("")).message, "");
  });

  it("uses the text of a non-Error cause", () => {
    assert.strictEqual(toLoggedError("Ahornweg/Punkt 12.md").message, "Ahornweg/Punkt 12.md");
    assert.strictEqual(toLoggedError(42).message, "42");
    assert.strictEqual(toLoggedError(undefined).message, "undefined");
  });

  it("does not throw for a cause that cannot be turned into text", () => {
    assert.strictEqual(toLoggedError(Object.create(null)).message, "[unprintable]");
    assert.deepStrictEqual(toLoggedError(Object.create(null)).frames, []);
  });

  it("uses an empty message when the message of an Error is not a string", () => {
    const error = new Error("x");
    Object.defineProperty(error, "message", { value: 7 });
    assert.strictEqual(toLoggedError(error).message, "");
  });

  it("gives a non-Error cause no frames", () => {
    assert.deepStrictEqual(toLoggedError("at a (b.js:1:2)").frames, []);
  });
});

describe("toLoggedError frames, V8 format", () => {
  it("keeps the function and reduces the location to its last segment", () => {
    assert.deepStrictEqual(
      framesOf(
        "    at Object.callback (plugin:weg-manager:1234:56)",
        "    at t.run (app://obsidian.md/app.js:1:23456)",
      ),
      ["Object.callback (plugin:weg-manager:1234:56)", "t.run (app.js:1:23456)"],
    );
  });

  it("reduces a bare location, for Windows and POSIX paths", () => {
    assert.deepStrictEqual(
      framesOf(
        "    at C:\\Users\\Erika Mustermann\\vault\\.obsidian\\plugins\\weg-manager\\main.js:10:5",
        "    at /home/erika/Vault Ünder/.obsidian/plugins/weg-manager/main.js:7:8",
      ),
      ["main.js:10:5", "main.js:7:8"],
    );
  });

  it("reduces a location in parentheses that itself contains parentheses and spaces", () => {
    assert.deepStrictEqual(
      framesOf(
        "    at run (C:\\Program Files (x86)\\Erika Mustermann\\main.js:3:4)",
        "    at C:\\Users\\Erika (privat)\\main.js:5:6",
      ),
      ["run (main.js:3:4)", "main.js:5:6"],
    );
  });

  it("drops the query string and the hash of a location", () => {
    assert.deepStrictEqual(
      framesOf(
        "    at f (app://obsidian.md/app.js?v=Ahornweg/Punkt.js:1:2)",
        "    at g (app://obsidian.md/app.js#frag/x:3:4)",
        "    at h (C:\\a\\b?c\\main.js:5:6)",
      ),
      ["f (app.js:1:2)", "g (app.js:3:4)", "h (main.js:5:6)"],
    );
  });

  it("keeps async, new and anonymous function names", () => {
    assert.deepStrictEqual(
      framesOf(
        "    at async Promise.all (index 0)",
        "    at async Foo.load (main.js:1:2)",
        "    at new Foo (main.js:3:4)",
        "    at Object.<anonymous> (main.js:5:6)",
        "    at Foo.bar [as baz] (main.js:7:8)",
        "    at Array.map (<anonymous>)",
      ),
      [
        "async Foo.load (main.js:1:2)",
        "new Foo (main.js:3:4)",
        "Object.<anonymous> (main.js:5:6)",
        "Foo.bar [as baz] (main.js:7:8)",
        "Array.map (<anonymous>)",
      ],
    );
  });

  it("accepts leading whitespace of any kind and trailing whitespace", () => {
    assert.deepStrictEqual(
      framesOf("at a (x.js:1:2)", "\tat b (y.js:3:4)  ", "  at c (z.js:5:6)\r"),
      ["a (x.js:1:2)", "b (y.js:3:4)", "c (z.js:5:6)"],
    );
  });

  it("drops a function name that carries anything but code characters", () => {
    assert.deepStrictEqual(
      framesOf(
        "    at Ahornweg/Punkt.md (main.js:1:2)",
        "    at C:\\Users\\Erika (main.js:3:4)",
        "    at a:b (main.js:5:6)",
        "    at ok (main.js:7:8)",
      ),
      ["ok (main.js:7:8)"],
    );
  });

  it("drops a location whose last segment is not a plain file name", () => {
    assert.deepStrictEqual(
      framesOf(
        "    at a (Ahornweg/Punkt 12.md:1:2)",
        "    at b (Straße.js:1:2)",
        "    at c (C:\\Users\\Erika\\:1:2)",
        "    at d (ok_1-2.min.js:1:2)",
      ),
      ["d (ok_1-2.min.js:1:2)"],
    );
  });

  it("drops a location without line and column", () => {
    assert.deepStrictEqual(
      framesOf(
        "    at a (main.js)",
        "    at b (main.js:1)",
        "    at c (main.js:x:2)",
        "    at d main.js:1:2:3x",
      ),
      [],
    );
  });
});

describe("toLoggedError frames, JavaScriptCore and Firefox format", () => {
  it("keeps the function and reduces the location", () => {
    assert.deepStrictEqual(
      framesOf(
        "callback@plugin:weg-manager:1234:56",
        "run@app://obsidian.md/app.js:1:23456",
        "@/Users/erika/Vault/main.js:9:10",
      ),
      ["callback (plugin:weg-manager:1234:56)", "run (app.js:1:23456)", "main.js:9:10"],
    );
  });

  it("splits at the first @ so that a scoped path stays in the location", () => {
    assert.deepStrictEqual(framesOf("f@/home/erika/node_modules/@scope/pkg/index.js:1:2"), [
      "f (index.js:1:2)",
    ]);
  });

  it("drops a function name that carries anything but code characters", () => {
    assert.deepStrictEqual(framesOf("Fehler: Punkt 12.md@main.js:1:2", "a/b@main.js:3:4"), []);
  });

  it("drops native frames without a position and keeps anonymous natives", () => {
    assert.deepStrictEqual(framesOf("map@[native code]", "forEach@<anonymous>"), [
      "forEach (<anonymous>)",
    ]);
  });
});

describe("toLoggedError frames, unknown lines", () => {
  it("drops the header line, blank lines and anything else", () => {
    assert.deepStrictEqual(
      toLoggedError(
        withStack(
          [
            "TypeError: Ahornweg/Punkt 12.md",
            "",
            "   ",
            "just some text",
            "    at a (x.js:1:2)",
            "attention (x.js:1:2)",
            "    at",
            "    at ",
          ].join("\n"),
        ),
      ).frames,
      ["a (x.js:1:2)"],
    );
  });

  it("never parses a line of the message as a frame", () => {
    const message = "first\n    at secret (Punkt.md:1:2)\nlast@Punkt.md:3:4";
    const error = withStack(`Error: ${message}\n    at real (main.js:5:6)`, message);
    assert.deepStrictEqual(toLoggedError(error).frames, ["real (main.js:5:6)"]);
  });

  it("returns no frames for an empty or missing stack", () => {
    assert.deepStrictEqual(toLoggedError(withStack("")).frames, []);
    const error = new Error("x");
    Object.defineProperty(error, "stack", { value: undefined });
    assert.deepStrictEqual(toLoggedError(error).frames, []);
    Object.defineProperty(error, "stack", { value: 5 });
    assert.deepStrictEqual(toLoggedError(error).frames, []);
  });

  it("works with an empty message", () => {
    assert.deepStrictEqual(toLoggedError(withStack("Error\n    at a (x.js:1:2)", "")).frames, [
      "a (x.js:1:2)",
    ]);
  });
});

describe("toLoggedError frame cap", () => {
  const lines = Array.from({ length: 15 }, (_, index) => `    at f${index} (x.js:${index}:1)`);

  it("keeps the first ten frames", () => {
    assert.strictEqual(MAX_FRAMES, 10);
    const frames = framesOf(...lines);
    assert.strictEqual(frames.length, 10);
    assert.strictEqual(frames[0], "f0 (x.js:0:1)");
    assert.strictEqual(frames[9], "f9 (x.js:9:1)");
  });

  it("counts only the frames that are kept", () => {
    const junk = Array.from({ length: 5 }, () => "junk");
    assert.strictEqual(framesOf(...junk, ...lines).length, 10);
    assert.strictEqual(framesOf(...lines.slice(0, 10)).length, 10);
    assert.strictEqual(framesOf(...lines.slice(0, 9)).length, 9);
  });
});

describe("toLoggedError with a real error", () => {
  it("returns frames without any path separator", () => {
    const logged = toLoggedError(thrown());
    assert.strictEqual(logged.name, "TypeError");
    assert.strictEqual(logged.message, "x is undefined");
    assert.isAbove(logged.frames.length, 0);
    for (const frame of logged.frames) {
      assert.notInclude(frame, "/");
      assert.notInclude(frame, "\\");
      assert.notInclude(frame, "x is undefined");
    }
  });
});

describe("toLoggedError frames, hostile shapes", () => {
  it("takes the position from the end, not from a directory that looks like one", () => {
    assert.deepStrictEqual(framesOf("    at run (/home/weg:1:2/main.js:10:5)"), [
      "run (main.js:10:5)",
    ]);
  });

  it("treats a scheme as one only at the start of a location", () => {
    assert.deepStrictEqual(framesOf("    at /home/a://b?c/main.js:1:2"), ["main.js:1:2"]);
  });

  it("drops a V8 line whose closing bracket has no opening one", () => {
    assert.deepStrictEqual(framesOf("    at x<anonymous>)"), []);
  });

  it("drops a V8 line that opens its bracket without a function name", () => {
    assert.deepStrictEqual(framesOf("    at  (main.js:1:2)"), []);
  });

  it("drops a line that is neither format even when it is a valid location", () => {
    assert.deepStrictEqual(framesOf("<anonymous>"), []);
  });

  it("keeps the first frame of a stack without a header when the message is empty", () => {
    assert.deepStrictEqual(toLoggedError(withStack("run@main.js:1:2", "")).frames, [
      "run (main.js:1:2)",
    ]);
  });

  it("returns no frames when the stack is not a string", () => {
    const error = new Error("boom");
    Object.defineProperty(error, "stack", { value: 42 });
    assert.deepStrictEqual(toLoggedError(error).frames, []);
  });
});
