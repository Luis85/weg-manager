import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { appNoteTypes } from "../../../src/application/note-types";
import * as communities from "../../../src/domain/communities";
import * as notes from "../../../src/domain/notes";
import * as shell from "../../../src/domain/shell";

/** Every module's domain index, by folder name; the first test fails while a folder is missing. */
const DOMAIN_INDEXES: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  shell,
  notes,
  communities,
};

const DOMAIN = fileURLToPath(new URL("../../../src/domain/", import.meta.url));

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

/** The registry is composition: a type missing here is a note the index never shows. */
describe("appNoteTypes", () => {
  it("is checked against the domain index of every module folder", () => {
    const folders = readdirSync(DOMAIN, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    expect(Object.keys(DOMAIN_INDEXES).toSorted()).toEqual(folders.toSorted());
  });

  it("registers every note type a domain index exports, each once", () => {
    const exported = new Set(
      Object.values(DOMAIN_INDEXES).flatMap((index) => Object.values(index).filter(isNoteType)),
    );
    expect(exported).toContain(communities.communityType);
    expect(appNoteTypes).toHaveLength(exported.size);
    for (const type of exported) expect(appNoteTypes).toContain(type);
  });
});
