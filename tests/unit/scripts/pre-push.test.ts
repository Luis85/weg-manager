import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { chooseGate, isDocumentPath, parsePushLines, realGit } from "../../../scripts/pre-push.mjs";

const ZERO = "0".repeat(40);
const A = "a".repeat(40);
const B = "b".repeat(40);
const BASE = "c".repeat(40);

const tag = (remoteSha: string) => [
  { localRef: "refs/tags/0.3.0", localSha: A, remoteRef: "refs/tags/0.3.0", remoteSha },
];

const line = (localRef: string, localSha: string, remoteRef: string, remoteSha: string) =>
  `${localRef} ${localSha} ${remoteRef} ${remoteSha}`;

/** A git that knows which files differ per `base..tip`, and the merge-base of each tip. */
const fakeGit = (options: {
  files?: Record<string, string[] | undefined>;
  mergeBases?: Record<string, string | undefined>;
}) => {
  const asked: string[] = [];
  return {
    asked,
    mergeBase: (tip: string) => {
      asked.push(`merge-base ${tip}`);
      return options.mergeBases?.[tip];
    },
    changedFiles: (base: string, tip: string) => {
      asked.push(`diff ${base}..${tip}`);
      return options.files?.[`${base}..${tip}`];
    },
  };
};

describe("isDocumentPath", () => {
  it.each([
    ["docs/requirements/PBI-64 - Laufzeit.md", true],
    ["docs/archify/x/diagram.html", true],
    ["docs/deep/nested/file.json", true],
    ["README.md", true],
    ["AGENTS.md", true],
    [".github/pull_request_template.md", true],
    ["src/domain/shell/readme.md", true],
    ["src/main.ts", false],
    ["scripts/verify.mjs", false],
    ["package.json", false],
    ["THIRD-PARTY-NOTICES.txt", false],
    // Only a top-level docs/ folder counts, and only the folder, not a name that starts with it.
    ["src/docs/helper.ts", false],
    ["docs-tools/run.mjs", false],
    ["docs.ts", false],
    ["notes.md.ts", false],
  ])("%s -> %s", (path, expected) => {
    expect(isDocumentPath(path)).toBe(expected);
  });
});

describe("parsePushLines", () => {
  it("reads one line per pushed ref", () => {
    expect(
      parsePushLines(
        `${line("refs/heads/a", A, "refs/heads/a", B)}\n${line("refs/tags/t", A, "refs/tags/t", ZERO)}\n`,
      ),
    ).toEqual([
      { localRef: "refs/heads/a", localSha: A, remoteRef: "refs/heads/a", remoteSha: B },
      { localRef: "refs/tags/t", localSha: A, remoteRef: "refs/tags/t", remoteSha: ZERO },
    ]);
  });

  it("reads a deleted ref (local sha all zeros, ref shown as '(delete)')", () => {
    expect(parsePushLines(line("(delete)", ZERO, "refs/heads/old", B))).toEqual([
      { localRef: "(delete)", localSha: ZERO, remoteRef: "refs/heads/old", remoteSha: B },
    ]);
  });

  it("reads nothing from empty input", () => {
    expect(parsePushLines("")).toEqual([]);
    expect(parsePushLines("\n\n")).toEqual([]);
  });

  it.each([
    ["refs/heads/a"],
    [`refs/heads/a ${A} refs/heads/a`],
    [`r ${A} r nothex`],
    [`r ${A} r ${B} extra`],
  ])("gives up on a line that is not four fields with two object ids: %s", (text) => {
    expect(parsePushLines(text)).toBeUndefined();
  });

  it("accepts SHA-256 object ids", () => {
    const long = "d".repeat(64);
    expect(parsePushLines(line("refs/heads/a", long, "refs/heads/a", long))).toHaveLength(1);
  });
});

describe("chooseGate", () => {
  const update = [
    { localRef: "refs/heads/feat", localSha: A, remoteRef: "refs/heads/feat", remoteSha: BASE },
  ];

  it("runs only format:check when every changed file is a document", () => {
    const git = fakeGit({
      files: { [`${BASE}..${A}`]: ["docs/a.md", "README.md", "docs/x/y.json"] },
    });
    expect(chooseGate(update, git)).toMatchObject({ mode: "format" });
    expect(git.asked).toEqual([`diff ${BASE}..${A}`]);
  });

  it("runs the whole gate when a single other file changes", () => {
    const git = fakeGit({
      files: { [`${BASE}..${A}`]: ["docs/a.md", "docs/b.md", "src/main.ts"] },
    });
    expect(chooseGate(update, git)).toEqual({
      mode: "full",
      reason: "src/main.ts is not a document",
    });
  });

  it("runs the whole gate when the one other file is a config or a script", () => {
    for (const path of [
      "package.json",
      "scripts/verify.mjs",
      ".github/workflows/ci.yml",
      ".githooks/pre-push",
    ]) {
      const git = fakeGit({ files: { [`${BASE}..${A}`]: ["docs/a.md", path] } });
      expect(chooseGate(update, git).mode).toBe("full");
    }
  });

  it("compares a new branch with its merge-base with the default branch", () => {
    const push = [
      { localRef: "refs/heads/new", localSha: A, remoteRef: "refs/heads/new", remoteSha: ZERO },
    ];
    const git = fakeGit({ mergeBases: { [A]: BASE }, files: { [`${BASE}..${A}`]: ["docs/a.md"] } });
    expect(chooseGate(push, git).mode).toBe("format");
    expect(git.asked).toEqual([`merge-base ${A}`, `diff ${BASE}..${A}`]);
  });

  it("runs the whole gate for a new branch when the merge-base is unknown", () => {
    const push = [
      { localRef: "refs/heads/new", localSha: A, remoteRef: "refs/heads/new", remoteSha: ZERO },
    ];
    const git = fakeGit({ files: { [`${BASE}..${A}`]: ["docs/a.md"] } });
    expect(chooseGate(push, git)).toMatchObject({ mode: "full" });
  });

  it("runs the whole gate when the files cannot be compared (the remote's commit is not here)", () => {
    const git = fakeGit({ files: { [`${BASE}..${A}`]: undefined } });
    expect(chooseGate(update, git)).toMatchObject({ mode: "full" });
  });

  it("runs the whole gate when it cannot read what is pushed", () => {
    expect(chooseGate(undefined, fakeGit({}))).toMatchObject({ mode: "full" });
    expect(chooseGate([], fakeGit({}))).toMatchObject({ mode: "full" });
  });

  it("treats a deleted ref as pushing nothing and does not ask git about it", () => {
    const push = [
      { localRef: "(delete)", localSha: ZERO, remoteRef: "refs/heads/old", remoteSha: B },
    ];
    const git = fakeGit({});
    expect(chooseGate(push, git)).toMatchObject({ mode: "format" });
    expect(git.asked).toEqual([]);
  });

  it("still looks at the other refs of a push that also deletes one", () => {
    const pushes = [
      { localRef: "(delete)", localSha: ZERO, remoteRef: "refs/heads/old", remoteSha: B },
      ...update,
    ];
    const git = fakeGit({ files: { [`${BASE}..${A}`]: ["src/a.ts"] } });
    expect(chooseGate(pushes, git).mode).toBe("full");
  });

  it("runs the whole gate when one of several refs changes code", () => {
    const pushes = [
      update[0] as (typeof update)[number],
      { localRef: "refs/heads/two", localSha: B, remoteRef: "refs/heads/two", remoteSha: BASE },
    ];
    const git = fakeGit({
      files: { [`${BASE}..${A}`]: ["docs/a.md"], [`${BASE}..${B}`]: ["tests/unit/a.test.ts"] },
    });
    expect(chooseGate(pushes, git).mode).toBe("full");
  });

  describe("a tag", () => {
    it("is documents only when the commits it adds to the default branch are", () => {
      const git = fakeGit({
        mergeBases: { [A]: BASE },
        files: { [`${BASE}..${A}`]: ["docs/a.md"] },
      });
      expect(chooseGate(tag(ZERO), git).mode).toBe("format");
    });

    it("runs the whole gate when its commits change code", () => {
      const git = fakeGit({
        mergeBases: { [A]: BASE },
        files: { [`${BASE}..${A}`]: ["src/main.ts"] },
      });
      expect(chooseGate(tag(ZERO), git).mode).toBe("full");
    });

    it("adds no change when it points at a commit the default branch has", () => {
      const git = fakeGit({ mergeBases: { [A]: A }, files: { [`${A}..${A}`]: [] } });
      expect(chooseGate(tag(ZERO), git)).toMatchObject({ mode: "format" });
    });

    it("runs the whole gate when the default branch is unknown", () => {
      expect(chooseGate(tag(ZERO), fakeGit({})).mode).toBe("full");
    });
  });
});

describe("realGit, on a real repository", () => {
  const root = mkdtempSync(join(tmpdir(), "weg-pre-push-"));
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  const git = (...args: string[]) =>
    execFileSync(
      "git",
      [
        "-c",
        "user.name=t",
        "-c",
        "user.email=t@example.com",
        "-c",
        "commit.gpgsign=false",
        ...args,
      ],
      { cwd: root, encoding: "utf8" },
    ).trim();
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  const commit = (message: string) => {
    git("add", "-A");
    git("commit", "-q", "-m", message);
    return git("rev-parse", "HEAD");
  };

  // main: one commit; the remote's main is that commit.
  git("init", "-q", "-b", "main");
  write("src/code.ts", "export const a = 1;\nexport const b = 2;\nexport const c = 3;\n");
  write("docs/note.md", "# note\n");
  const main = commit("main");
  git("update-ref", "refs/remotes/origin/main", main);
  const real = realGit("origin", root);

  it("finds where a branch leaves the default branch", () => {
    git("checkout", "-q", "-b", "docs-only");
    write("docs/more.md", "# more\n");
    const tip = commit("docs");
    expect(real.mergeBase(tip)).toBe(main);
    expect(real.changedFiles(main, tip)).toEqual(["docs/more.md"]);
    expect(
      chooseGate(
        [
          {
            localRef: "refs/heads/docs-only",
            localSha: tip,
            remoteRef: "refs/heads/docs-only",
            remoteSha: ZERO,
          },
        ],
        real,
      ).mode,
    ).toBe("format");
  });

  it("lists both sides of a file moved into docs/, so the move is not hidden as a document", () => {
    git("checkout", "-q", "main");
    git("checkout", "-q", "-b", "move");
    git("mv", "src/code.ts", "docs/code.md");
    const tip = commit("move");
    expect(real.changedFiles(main, tip)?.toSorted()).toEqual(["docs/code.md", "src/code.ts"]);
    expect(
      chooseGate(
        [
          {
            localRef: "refs/heads/move",
            localSha: tip,
            remoteRef: "refs/heads/move",
            remoteSha: main,
          },
        ],
        real,
      ).mode,
    ).toBe("full");
  });

  it("answers with the files of an annotated tag, and nothing for a tag on the default branch", () => {
    git("checkout", "-q", "main");
    git("tag", "-a", "-m", "release", "on-main");
    const tagObject = git("rev-parse", "on-main");
    expect(tagObject).not.toBe(main);
    expect(real.mergeBase(tagObject)).toBe(main);
    expect(real.changedFiles(main, tagObject)).toEqual([]);
  });

  it("has no answer for an object the clone does not have", () => {
    expect(real.changedFiles("e".repeat(40), main)).toBeUndefined();
  });

  it("has no merge-base without a default branch on that remote", () => {
    expect(realGit("elsewhere", root).mergeBase(main)).toBeUndefined();
  });

  it("follows origin/HEAD to the default branch", () => {
    git("update-ref", "refs/remotes/upstream/trunk", main);
    git("symbolic-ref", "refs/remotes/upstream/HEAD", "refs/remotes/upstream/trunk");
    expect(realGit("upstream", root).mergeBase(main)).toBe(main);
  });
});

describe("the hook file", () => {
  it("is a tiny sh launcher of the Node script, passing its arguments on", () => {
    const hook = readFileSync(new URL("../../../.githooks/pre-push", import.meta.url), "utf8");
    expect(hook.startsWith("#!/bin/sh\n")).toBe(true);
    expect(hook).toContain('exec node scripts/pre-push.mjs "$@"');
    expect(hook.split("\n").filter((text) => text !== "" && !text.startsWith("#"))).toHaveLength(1);
  });
});
