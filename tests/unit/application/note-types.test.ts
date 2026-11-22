import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { appNoteTypes } from "../../../src/application/note-types";
import * as communities from "../../../src/domain/communities";
import * as notes from "../../../src/domain/notes";

const DOMAIN = fileURLToPath(new URL("../../../src/domain/", import.meta.url));

/** The domain index of every module folder. */
const domainIndexes = (): Promise<readonly Readonly<Record<string, unknown>>[]> =>
  Promise.all(
    readdirSync(DOMAIN, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) =>
        vi.importActual<Record<string, unknown>>(`../../../src/domain/${entry.name}/index.ts`),
      ),
  );

/** The keys of every `defineNoteType` result; an export with exactly these is a note type. */
const NOTE_TYPE_KEYS = Object.keys(
  notes.defineNoteType({ type: "probe", version: 1, fields: {}, migrations: {} }),
)
  .toSorted()
  .join();

const isNoteType = (value: unknown): boolean =>
  typeof value === "object" &&
  value !== null &&
  Object.keys(value).toSorted().join() === NOTE_TYPE_KEYS;

/** The registry is composition: a type missing in a manifest is a note the index never shows. */
describe("appNoteTypes", () => {
  it("registers every note type a module's domain index exports, each once", async () => {
    const exported = new Set(
      (await domainIndexes()).flatMap((index) => Object.values(index).filter(isNoteType)),
    );
    expect(exported).toContain(communities.communityType);
    expect(appNoteTypes).toHaveLength(exported.size);
    for (const type of exported) expect(appNoteTypes).toContain(type);
  });
});
