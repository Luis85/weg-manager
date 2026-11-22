import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { OVERRIDES } from "../../../scripts/notice-overrides.mjs";
import { afterEach, describe, expect, it } from "vitest";
import {
  NOTICES_FILE,
  findNoticeFiles,
  normalizeText,
  readPackage,
  renderNotices,
  runNotices,
} from "../../../scripts/third-party-notices.mjs";

const dirs: string[] = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "notices-"));
  dirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const mit = (holder: string) =>
  `MIT License\n\nCopyright (c) ${holder}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software.\n`;

type Fixture = {
  version?: string;
  json?: Record<string, unknown>;
  files?: Record<string, string>;
};

/** A repository root with `node_modules/<name>` packages, a package list and a built bundle. */
const repo = (packages: Record<string, Fixture>, listed = Object.keys(packages)) => {
  const root = temp();
  for (const [name, fixture] of Object.entries(packages)) {
    const dir = join(root, "node_modules", name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "package.json"),
      JSON.stringify({ name, version: fixture.version ?? "1.2.3", ...fixture.json }),
    );
    for (const [file, text] of Object.entries(fixture.files ?? {})) {
      mkdirSync(dirname(join(dir, file)), { recursive: true });
      writeFileSync(join(dir, file), text);
    }
  }
  mkdirSync(join(root, "dist"), { recursive: true });
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "dist", "main.js"), "bundle");
  writeFileSync(
    join(root, "reports", "bundled-packages.json"),
    JSON.stringify({
      mainJsSha256: createHash("sha256").update("bundle").digest("hex"),
      packages: Object.fromEntries(listed.map((name) => [name, ["js"]])),
    }),
  );
  return root;
};

const licensed = (holder: string, extra: Fixture = {}): Fixture => ({
  json: { license: "MIT", ...extra.json },
  files: { LICENSE: mit(holder), ...extra.files },
});

describe("normalizeText", () => {
  it("uses LF, drops trailing blanks and surrounding empty lines, and ends with one newline", () => {
    expect(normalizeText("\r\n\r\nLine one  \r\n\tLine two\r\n\r\n\r\n")).toBe(
      "Line one\n\tLine two\n",
    );
  });
});

describe("normalizeText and a byte order mark", () => {
  it("drops it, so the text is the same on every editor", () => {
    expect(normalizeText("\uFEFFMIT License\n")).toBe("MIT License\n");
  });
});

describe("OVERRIDES", () => {
  it("has the vaul-vue entry from its repository's LICENSE, which the package does not ship", () => {
    const root = repo({ "vaul-vue": {} });
    const entry = readPackage({ root, name: "vaul-vue" });
    expect(entry.license).toBe("MIT");
    expect(entry.texts[0]?.text).toContain("Copyright (c) 2025 unovue\n");
    expect(entry.texts[0]?.text).toContain("Permission is hereby granted");
  });

  it("gives every entry a licence and exactly one of a copyright line and a text", () => {
    for (const override of Object.values(OVERRIDES)) {
      expect(override.license).not.toBe("");
      expect(Number("copyright" in override) + Number("text" in override)).toBe(1);
    }
  });
});

describe("findNoticeFiles", () => {
  it("finds licence and notice files by name, licences first, and skips code and folders", () => {
    const root = repo({
      p: {
        files: {
          NOTICE: "n",
          "LICENSE-MIT": "a",
          LICENCE: "b",
          "license.txt": "c",
          COPYING: "d",
          "NOTICE.txt": "e",
          "README.md": "f",
          "license.js": "g",
          "licenses/x": "h",
          "license-checker.json": "i",
        },
      },
    });
    expect(findNoticeFiles(join(root, "node_modules", "p"))).toEqual([
      { file: "COPYING", kind: "license" },
      { file: "LICENCE", kind: "license" },
      { file: "LICENSE-MIT", kind: "license" },
      { file: "license.txt", kind: "license" },
      { file: "NOTICE", kind: "notice" },
      { file: "NOTICE.txt", kind: "notice" },
    ]);
  });
});

const read = (root: string, name: string, overrides = {}) => readPackage({ root, name, overrides });

describe("readPackage", () => {
  it("takes the licence id from package.json and the text from the licence file", () => {
    const root = repo({ a: licensed("Ann") });
    expect(read(root, "a")).toEqual({
      name: "a",
      license: "MIT",
      texts: [{ kind: "license", text: mit("Ann") }],
    });
  });

  it("accepts the legacy { type } form of the license field", () => {
    const root = repo({
      a: { json: { license: { type: "ISC" } }, files: { LICENSE: "isc text" } },
    });
    expect(read(root, "a").license).toBe("ISC");
  });

  it("includes the NOTICE file next to the licence, as Apache-2.0 requires", () => {
    const root = repo({
      a: {
        json: { license: "Apache-2.0" },
        files: { LICENSE: "apache", NOTICE: "Acme notice\r\n" },
      },
    });
    expect(read(root, "a").texts).toEqual([
      { kind: "license", text: "apache\n" },
      { kind: "notice", text: "Acme notice\n" },
    ]);
  });

  it("writes the standard MIT text with the author as copyright line when there is no file", () => {
    const root = repo({
      a: { json: { license: "MIT", author: "Jane Doe <jane@example.org> (https://example.org)" } },
    });
    const [entry] = read(root, "a").texts;
    expect(entry?.text).toContain("MIT License\n\nCopyright (c) Jane Doe\n");
    expect(entry?.text).toContain("Permission is hereby granted, free of charge");
    expect(entry?.text).not.toContain("example.org");
  });

  it("marks an entry whose standard text the script wrote, and no other", () => {
    const root = repo({
      none: { json: { license: "MIT", author: "Jane" } },
      file: licensed("Ann"),
      verbatim: { json: { license: "ISC" } },
      copyright: {},
    });
    const overrides = {
      verbatim: { license: "ISC", text: "Upstream text" },
      copyright: { license: "MIT", copyright: "Copyright (c) 2025 unovue" },
    };
    expect(read(root, "none", overrides).generated).toBe(true);
    expect(read(root, "copyright", overrides).generated).toBe(true);
    expect(read(root, "file", overrides)).not.toHaveProperty("generated");
    expect(read(root, "verbatim", overrides)).not.toHaveProperty("generated");
  });

  it("writes the standard ISC text from an author object", () => {
    const root = repo({ a: { json: { license: "ISC", author: { name: "Joe" } } } });
    expect(read(root, "a").texts[0]?.text).toContain("ISC License\n\nCopyright (c) Joe\n");
  });

  it.each([
    ["no file, no author", { json: { license: "MIT" } }],
    [
      "no file, a licence without a standard text here",
      { json: { license: "Apache-2.0", author: "A" } },
    ],
    ["no file, an expression", { json: { license: "(MIT OR ISC)", author: "A" } }],
  ])("names the package and fails for %s", (_label, fixture: Fixture) => {
    const root = repo({ lonely: fixture });
    expect(() => read(root, "lonely")).toThrow(/lonely/);
  });

  it("fails and names the package when there is no license field and no override", () => {
    const root = repo({ vaul: { files: { LICENSE: mit("X") } } });
    expect(() => read(root, "vaul")).toThrow(/vaul.*license/);
  });

  it("fails when the package is not installed", () => {
    expect(() => read(repo({}), "ghost")).toThrow(/ghost/);
  });

  describe("overrides", () => {
    it("supply the licence id and a standard text with the given copyright line", () => {
      const root = repo({ vaul: {} });
      const overrides = { vaul: { license: "MIT", copyright: "Copyright (c) 2025 unovue" } };
      const entry = read(root, "vaul", overrides);
      expect(entry.license).toBe("MIT");
      expect(entry.texts[0]?.text).toContain("Copyright (c) 2025 unovue\n");
    });

    it("supply a verbatim text", () => {
      const root = repo({ icons: { json: { license: "ISC" } } });
      const overrides = { icons: { license: "ISC", text: "Upstream text\r\nline two" } };
      expect(read(root, "icons", overrides).texts).toEqual([
        { kind: "license", text: "Upstream text\nline two\n" },
      ]);
    });

    it("yield to a licence file the package ships", () => {
      const root = repo({ a: { files: { LICENSE: mit("Real") } } });
      const overrides = { a: { license: "MIT", copyright: "Copyright (c) Other" } };
      expect(read(root, "a", overrides).texts).toEqual([{ kind: "license", text: mit("Real") }]);
    });

    it("fail when package.json names another licence than the override: the evidence is out of date", () => {
      const root = repo({ a: { json: { license: "Apache-2.0" } } });
      const overrides = { a: { license: "MIT", copyright: "Copyright (c) X" } };
      expect(() => read(root, "a", overrides)).toThrow(/a.*Apache-2\.0.*MIT/);
    });
  });
});

const written = (root: string) => readFileSync(join(root, NOTICES_FILE), "utf8");

const entry = (name: string, holder: string, license = "MIT") => ({
  name,
  license,
  texts: [{ kind: "license" as const, text: mit(holder) }],
});

describe("renderNotices", () => {
  it("indexes the packages with their licence and groups identical texts", () => {
    const text = renderNotices([entry("b", "Ann"), entry("a", "Ann"), entry("c", "Bob")]);
    expect(text).toContain("a (MIT)\nb (MIT)\nc (MIT)\n");
    expect(text.match(/Copyright \(c\) Ann/g)).toHaveLength(1);
    expect(text.match(/Copyright \(c\) Bob/g)).toHaveLength(1);
    expect(text).toContain("a, b\n");
  });

  it("keeps the copyright line of every package: texts that differ stay apart", () => {
    const text = renderNotices([entry("a", "Ann"), entry("b", "Bob")]);
    expect(text).toContain("Copyright (c) Ann");
    expect(text).toContain("Copyright (c) Bob");
  });

  it("gives the same output in any input order, with LF only and a single final newline", () => {
    const entries = [entry("z", "Z"), entry("@s/a", "A"), entry("m", "A")];
    const text = renderNotices(entries);
    expect(renderNotices(entries.toReversed())).toBe(text);
    expect(text).not.toContain("\r");
    expect(text.endsWith("\n")).toBe(true);
    expect(text.endsWith("\n\n")).toBe(false);
    expect(text.indexOf("@s/a")).toBeLessThan(text.indexOf("\nm "));
  });

  it("marks a package whose licence text was generated, in the index and in its section", () => {
    const generated = { ...entry("gen", "Jane"), generated: true as const };
    const text = renderNotices([entry("real", "Ann"), generated]);
    expect(text).toContain("gen (MIT, licence text generated)\nreal (MIT)\n");
    expect(text).toMatch(
      /gen\nLicence: MIT\nLicence text: generated from the standard text, the package ships no licence file\n/,
    );
    expect(text.match(/Licence text: generated/g)).toHaveLength(1);
  });

  it("keeps a generated entry apart from a package with the same text from a file", () => {
    const text = renderNotices([entry("a", "Ann"), { ...entry("b", "Ann"), generated: true }]);
    expect(text.match(/Copyright \(c\) Ann/g)).toHaveLength(2);
  });

  it("labels a NOTICE file", () => {
    const text = renderNotices([
      {
        name: "apache",
        license: "Apache-2.0",
        texts: [
          { kind: "license", text: "Apache text\n" },
          { kind: "notice", text: "Acme notice\n" },
        ],
      },
    ]);
    expect(text).toMatch(/Apache text\n\nNOTICE\n\nAcme notice\n/);
  });
});

describe("runNotices", () => {
  const packages = { a: licensed("Ann"), b: licensed("Bob") };

  it("writes the file, with no version number and no path of the machine", () => {
    const root = repo({ ...packages, a: { ...packages.a, version: "9.8.7" } });
    const result = runNotices({ root, check: false });
    expect(result.ok).toBe(true);
    expect(written(root)).toContain("Copyright (c) Ann");
    expect(written(root)).not.toContain("9.8.7");
    expect(written(root)).not.toContain(root);
  });

  it("names the packages with a generated licence text, when it writes and when it checks", () => {
    const root = repo({ ...packages, gen: { json: { license: "MIT", author: "Jane" } } });
    const wrote = runNotices({ root, check: false });
    expect(wrote.message).toContain("licence text generated (no licence file): gen");
    expect(wrote.message).not.toMatch(/: .*\ba\b/);
    const checked = runNotices({ root, check: true });
    expect(checked.ok).toBe(true);
    expect(checked.message).toContain("licence text generated (no licence file): gen");
  });

  it("says nothing about generated texts when there are none", () => {
    const root = repo(packages);
    expect(runNotices({ root, check: false }).message).not.toContain("generated");
  });

  it("passes the check when the file is current", () => {
    const root = repo(packages);
    runNotices({ root, check: false });
    expect(runNotices({ root, check: true }).ok).toBe(true);
  });

  it("does not care about a version bump", () => {
    const root = repo(packages);
    runNotices({ root, check: false });
    for (const name of ["a", "b"]) {
      writeFileSync(
        join(root, "node_modules", name, "package.json"),
        JSON.stringify({ name, version: "2.0.0", license: "MIT" }),
      );
    }
    expect(runNotices({ root, check: true }).ok).toBe(true);
  });

  it("fails the check with a one-line instruction when a package was added", () => {
    const root = repo(packages, ["a"]);
    runNotices({ root, check: false });
    writeFileSync(
      join(root, "reports", "bundled-packages.json"),
      JSON.stringify({
        mainJsSha256: createHash("sha256").update("bundle").digest("hex"),
        packages: { a: ["js"], b: ["js"] },
      }),
    );
    const result = runNotices({ root, check: true });
    expect(result.ok).toBe(false);
    expect(result.message.split("\n")).toHaveLength(1);
    expect(result.message).toContain("npm run notices");
  });

  it("fails the check when a licence text changed", () => {
    const root = repo(packages);
    runNotices({ root, check: false });
    writeFileSync(join(root, "node_modules", "a", "LICENSE"), mit("Ann Changed"));
    expect(runNotices({ root, check: true }).ok).toBe(false);
  });

  it("fails the check when the file is missing", () => {
    const result = runNotices({ root: repo(packages), check: true });
    expect(result.ok).toBe(false);
    expect(result.message).toContain("npm run notices");
  });

  it("does not write in check mode", () => {
    const root = repo(packages);
    runNotices({ root, check: true });
    expect(existsSync(join(root, NOTICES_FILE))).toBe(false);
  });

  it("asks for a build when the package list is missing", () => {
    const root = repo(packages);
    rmSync(join(root, "reports", "bundled-packages.json"));
    const result = runNotices({ root, check: true });
    expect(result.ok).toBe(false);
    expect(result.message).toContain("npm run build");
  });

  it("asks for a build when the package list belongs to another bundle", () => {
    const root = repo(packages);
    writeFileSync(join(root, "dist", "main.js"), "another bundle");
    const result = runNotices({ root, check: true });
    expect(result.ok).toBe(false);
    expect(result.message).toContain("npm run build");
  });

  it("reports a package it cannot write a notice for", () => {
    const root = repo({ ...packages, c: { json: { license: "MIT" } } });
    const result = runNotices({ root, check: false });
    expect(result.ok).toBe(false);
    expect(result.message).toContain("c");
    expect(existsSync(join(root, NOTICES_FILE))).toBe(false);
  });
});
