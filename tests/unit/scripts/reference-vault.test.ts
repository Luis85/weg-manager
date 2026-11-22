import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  REFERENCE_PROFILE,
  referenceVault,
  writeReferenceVault,
} from "../../../scripts/reference-vault.mjs";
import { splitFrontmatter } from "../../support/obsidian/metadata-cache";
import { parseYaml } from "../../support/obsidian/yaml";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
const SNAKE_CASE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;

/** Each note's frontmatter, or `undefined` for a plain note. */
const frontmatterOf = (text: string): Record<string, unknown> | undefined => {
  const split = splitFrontmatter(text);
  if (split === undefined) return undefined;
  const parsed: unknown = parseYaml(split.yaml);
  return (parsed as Record<string, unknown> | null) ?? {};
};

const records = (vault: ReadonlyMap<string, string>) =>
  [...vault].flatMap(([path, text]) => {
    const frontmatter = frontmatterOf(text);
    return frontmatter === undefined ? [] : [{ path, frontmatter }];
  });

let dirs: string[] = [];

const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), "reference-vault-"));
  dirs.push(dir);
  return dir;
};

const filesIn = (dir: string) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split("\\").join("/"))
    .toSorted();

const lines = (...text: string[]) => [...text, ""].join("\n");

afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs = [];
});

describe("referenceVault", () => {
  it("holds the desktop reference profile of F-21 by default", () => {
    expect(REFERENCE_PROFILE).toEqual({ communities: 2, points: 200, records: 2000, plain: 200 });
    const vault = referenceVault();
    const all = records(vault);
    expect(vault.size).toBe(2200);
    expect(all).toHaveLength(2000);
    const types = all.map(({ frontmatter }) => frontmatter["schema"]);
    expect(types.filter((schema) => schema === "weg-manager.community/v1")).toHaveLength(2);
    expect(types.filter((schema) => schema === "weg-manager.item/v1")).toHaveLength(1998);
    const points = all.filter(({ frontmatter }) => frontmatter["kind"] === "point");
    expect(points).toHaveLength(200);
  });

  it("writes records in the file contract's shape (ADR 0007)", () => {
    const all = records(referenceVault());
    const communities = all.filter(
      ({ frontmatter }) => frontmatter["schema"] === "weg-manager.community/v1",
    );
    const communityIds = new Set(communities.map(({ frontmatter }) => frontmatter["id"]));
    expect(communityIds.size).toBe(2);
    for (const { frontmatter } of all) {
      const type = /^weg-manager\.([a-z][a-z-]*)\/v1$/.exec(String(frontmatter["schema"]))?.[1];
      expect(type).toBeDefined();
      expect(String(frontmatter["id"])).toMatch(new RegExp(`^${type}-${UUID}$`));
      for (const key of Object.keys(frontmatter)) expect(key).toMatch(SNAKE_CASE);
    }
    expect(communities.filter(({ frontmatter }) => "community_id" in frontmatter)).toEqual([]);
    const items = all.filter(({ frontmatter }) => frontmatter["schema"] === "weg-manager.item/v1");
    expect(
      items.filter(({ frontmatter }) => !communityIds.has(frontmatter["community_id"])),
    ).toEqual([]);
    const ids = all.map(({ frontmatter }) => frontmatter["id"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("writes a community, a point, a note and a plain note byte for byte", () => {
    const community = "community-00fb8673-8b42-4835-a84f-3e32248c1e89";
    expect([...referenceVault({ seed: 7, points: 1, records: 4, plain: 1 })]).toEqual([
      ["Privat/Gedanke 0001.md", lines("# Gedanke 0001", "", "Ein Gedanke zu Rauchmelder.")],
      [
        "WEG Manager/Gemeinschaften/Ahornweg 12.md",
        lines(
          "---",
          "schema: weg-manager.community/v1",
          `id: ${community}`,
          "name: Ahornweg 12",
          "short_code: AW",
          "color: teal",
          "kind: WEG",
          "unit_label: Einheiten",
          "---",
          "",
          "# Ahornweg 12",
        ),
      ],
      [
        "WEG Manager/Gemeinschaften/Birkenallee 3.md",
        lines(
          "---",
          "schema: weg-manager.community/v1",
          "id: community-f9ed0256-01c5-47fb-b552-2e53a50ae8da",
          "name: Birkenallee 3",
          "short_code: BA",
          "color: violet",
          "kind: WEG",
          "unit_label: Einheiten",
          "---",
          "",
          "# Birkenallee 3",
        ),
      ],
      [
        "WEG Manager/Notizen/BA/Notiz 0001.md",
        lines(
          "---",
          "schema: weg-manager.item/v1",
          "id: item-9d2f8926-3ddb-4f9b-8739-cd3878247720",
          "community_id: community-f9ed0256-01c5-47fb-b552-2e53a50ae8da",
          "kind: note",
          "title: Hausordnung",
          "date: 2026-01-04",
          "---",
          "",
          "# Notiz 0001",
          "",
          "Notiz zum Thema Hausordnung.",
        ),
      ],
      [
        "WEG Manager/Punkte/AW/P-001.md",
        lines(
          "---",
          "schema: weg-manager.item/v1",
          "id: item-aefd9ff8-d085-48cf-ad6a-b84300fda099",
          `community_id: ${community}`,
          "kind: point",
          "number: P-001",
          "title: Tiefgarage",
          "status: done",
          "date: 2026-04-28",
          "---",
          "",
          "# P-001 Tiefgarage",
          "",
          "Der Beirat prüft das Thema Tiefgarage.",
        ),
      ],
    ]);
  });

  it("gives the same bytes for the same seed and others for another seed", () => {
    expect(referenceVault({ seed: 3 })).toEqual(referenceVault({ seed: 3 }));
    expect(referenceVault()).toEqual(referenceVault({ seed: 1 }));
    expect(referenceVault({ seed: 4 })).not.toEqual(referenceVault({ seed: 3 }));
  });

  it("builds a smaller variant and refuses a profile without room for the points", () => {
    const small = referenceVault({ points: 20, records: 200, plain: 20 });
    expect(small.size).toBe(220);
    expect(records(small)).toHaveLength(200);
    expect(() => referenceVault({ points: 10, records: 11 })).toThrow(
      "records (11) must hold the communities (2) and the points (10)",
    );
  });
});

describe("writeReferenceVault", () => {
  it("replaces the target folder with the vault's files", () => {
    const target = join(tempDir(), "vault");
    writeReferenceVault(target, { points: 2, records: 5, plain: 1 });
    writeFileSync(join(target, "stale.md"), "old");
    const written = writeReferenceVault(target, { points: 2, records: 6, plain: 1 });
    const expected = referenceVault({ points: 2, records: 6, plain: 1 });
    expect(written).toEqual({ files: 7, records: 6, plain: 1 });
    expect(filesIn(target)).toEqual([...expected.keys()].toSorted());
    for (const [path, text] of expected)
      expect(readFileSync(join(target, path), "utf8")).toBe(text);
  });
});
