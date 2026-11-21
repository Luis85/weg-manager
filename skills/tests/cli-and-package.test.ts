import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseArguments, run } from "../src/gmail/cli.ts";
import {
  buildPackage,
  bundleWriter,
  SKILL_NAME,
  WRITER,
  type SkillManifest,
} from "../src/package-skills.ts";
import { readStoredZip } from "../src/zip.ts";
import { createHash } from "node:crypto";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const INPUT = {
  account_id: "beirat@example.test",
  messages: [
    {
      gmail_message_id: "m-17",
      subject: "Prüftermin",
      body_text: "Text",
      body_status: "complete",
      received_at: "2026-11-14T10:00:00+01:00",
    },
  ],
};

let root: string;
let writer: string;
beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), "gmail-cli-"));
  mkdirSync(join(root, "vault"));
  writeFileSync(join(root, "input.json"), `\uFEFF${JSON.stringify(INPUT)}`);
  writer = await bundleWriter(REPO);
}, 60_000);
afterAll(() => rmSync(root, { recursive: true, force: true }));

const capture = (argv: string[]) => {
  const out: string[] = [];
  const err: string[] = [];
  const code = run(
    argv,
    (text) => out.push(text),
    (text) => err.push(text),
  );
  return { code, out: out.join(""), err: err.join("") };
};
const args = (...extra: string[]) => [
  "--input",
  join(root, "input.json"),
  `--vault=${join(root, "vault")}`,
  ...extra,
];

describe("command line", () => {
  it("previews by default and prints ASCII-only JSON", () => {
    const { code, out } = capture(args());
    expect(code).toBe(0);
    expect(out).toContain('"mode": "preview"');
    expect(out).toContain("Pr\\u00fcftermin");
  });

  it("reports input errors as JSON with exit code 2", () => {
    const { code, out } = capture(["--input", join(root, "missing.json"), "--vault", root]);
    expect(code).toBe(2);
    expect(out).toMatch(/^\{"error": ".*"\}\n$/);
  });

  it("explains missing and unknown arguments on stderr", () => {
    expect(parseArguments(["--vault", "v"])).toBe("the following arguments are required: --input");
    expect(parseArguments(["--input", "a", "--vault", "v", "--force"])).toBe(
      "unrecognized arguments: --force",
    );
    expect(capture(["--apply"]).err).toContain("error: the following arguments are required");
  });

  it("prints help", () => {
    const help = capture(["-h"]);
    expect(help.code).toBe(0);
    expect(help.out).toContain("--apply");
  });

  it("runs as the generated script under Node", () => {
    const script = join(root, "import-messages.mjs");
    writeFileSync(script, writer);
    const out = execFileSync(process.execPath, [script, ...args("--apply")], { encoding: "utf8" });
    expect(JSON.parse(out)).toMatchObject({ mode: "apply", counts: { created: 1 } });
  });
});

describe("skill package", () => {
  it("keeps the committed writer in sync with its TypeScript source", () => {
    const committed = readFileSync(join(REPO, "skills", SKILL_NAME, WRITER), "utf8");
    expect(committed, "run npm run skills:package").toBe(writer);
  });

  it("bundles a self-contained skill folder and a matching manifest", () => {
    const manifest = buildPackage(REPO, join(root, "out"), writer);
    const item = manifest.skills[0] ?? {};
    const archive = readFileSync(join(root, "out", String(item["archive"])));
    expect(createHash("sha256").update(archive).digest("hex")).toBe(item["sha256"]);
    const names = readStoredZip(archive).map((entry) => entry.name);
    expect(names).toEqual([
      `${SKILL_NAME}/LICENSE`,
      `${SKILL_NAME}/SKILL.md`,
      `${SKILL_NAME}/references/email-note-schema.md`,
      `${SKILL_NAME}/references/runtime-and-installation.md`,
      `${SKILL_NAME}/${WRITER}`,
    ]);
    const saved = JSON.parse(
      readFileSync(join(root, "out", "manifest.json"), "utf8"),
    ) as SkillManifest;
    expect(saved).toEqual(manifest);
  });

  it("builds byte-identical archives", () => {
    const one = buildPackage(REPO, join(root, "one"), writer).skills[0]?.["sha256"];
    const two = buildPackage(REPO, join(root, "two"), writer).skills[0]?.["sha256"];
    expect(one).toBe(two);
  });

  it("keeps the committed manifest in sync with a fresh build", () => {
    const fresh = buildPackage(REPO, join(root, "fresh"), writer);
    const committed = JSON.parse(
      readFileSync(join(REPO, "skills/manifest.json"), "utf8"),
    ) as SkillManifest;
    expect(committed, "run npm run skills:package").toEqual(fresh);
  });
});
