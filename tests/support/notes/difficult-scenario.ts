import type { DifficultNote } from "./difficult-notes";
import type { Outcome } from "./probe-api";
import type { ScenarioContext, ScenarioProbe } from "./scenario-context";

/** What the scenario finds out about one note of `DIFFICULT_NOTES`. */
export type DifficultFacts = {
  readonly name: string;
  /** `metadataCache.getFileCache(file)?.frontmatter`. */
  readonly frontmatter: unknown;
  /** Whether the cache counts the file as having frontmatter (`frontmatterPosition`). */
  readonly position: boolean;
  /** The lines of the cache's `yaml` section, or `null` without one. */
  readonly yaml: readonly [number, number] | null;
  /** `parseYaml` of the text between the section's fences: the value, or the error's name. */
  readonly parsed: unknown;
  readonly read: Outcome<unknown>;
  readonly update: Outcome<unknown>;
  /** The raw text after the update (BOM included), and what the cache then holds. */
  readonly written: string;
  readonly frontmatterAfter: unknown;
};

/**
 * The scenario "note with difficult frontmatter": every note of `notes` is created in `Schwierig/`
 * as a person or another plugin writes it, and the scenario records what the metadata cache and
 * `parseYaml` read from it and what the `NoteStore` adapter does with it (read, list, unreadable,
 * one update). Runs unchanged in real Obsidian (`tests/e2e/specs/difficult-frontmatter.e2e.ts`)
 * and on the double (`tests/unit/support/obsidian-double.test.ts`); both compare with
 * `DIFFICULT_FACTS`. It waits on the recorder's fence (`recorder.ts`), never on a timer.
 * `executeObsidian` serialises the function, so it uses only its arguments.
 */
export const difficultScenario = async (
  { app, obsidian, plugins }: ScenarioContext,
  notes: readonly DifficultNote[],
) => {
  const { api: probe, recorder: makeRecorder } = (
    plugins as { readonly noteStoreProbe: ScenarioProbe }
  ).noteStoreProbe;
  const recorder = makeRecorder({});
  const { fence } = recorder;
  const folder = "Schwierig";
  const file = (name: string) => {
    const found = app.vault.getFileByPath(`${folder}/${name}.md`);
    if (found === null) throw new Error(`no note ${name}`);
    return found;
  };
  const raw = async (name: string) => {
    let text = "";
    await app.vault.process(file(name), (data) => {
      text = data;
      return data;
    });
    return text;
  };
  const parse = (text: string, yaml: readonly [number, number] | null) => {
    if (yaml === null) return null;
    const lines = text.replace(/^﻿/, "").split("\n").slice(1, yaml[1]);
    try {
      return obsidian.parseYaml(lines.map((line) => `${line}\n`).join(""));
    } catch (error) {
      return (error as Error).name;
    }
  };

  if (app.vault.getFolderByPath(folder) === null) await app.vault.createFolder(folder);
  await Promise.all(notes.map((note) => app.vault.create(`${folder}/${note.name}.md`, note.text)));
  await fence();
  const read = await Promise.all(
    notes.map(async (note) => {
      const cache = app.metadataCache.getFileCache(file(note.name));
      const section = cache?.sections?.find((candidate) => candidate.type === "yaml");
      const yaml: readonly [number, number] | null =
        section === undefined ? null : [section.position.start.line, section.position.end.line];
      return {
        name: note.name,
        frontmatter: cache?.frontmatter ?? null,
        position: cache?.frontmatterPosition !== undefined,
        yaml,
        parsed: parse(note.text, yaml),
        read: await probe.read(`${folder}/${note.name}.md`),
      };
    }),
  );
  const listed = await probe.list();
  const unreadable = await probe.unreadable(folder);
  // Each note its own file, so the updates go at once and one fence ends them all.
  const updates = await Promise.all(
    notes.map((note) =>
      probe.update(`${folder}/${note.name}.md`, note.patch ?? { set: { name: "Neu" } }),
    ),
  );
  await fence();
  const facts: DifficultFacts[] = await Promise.all(
    read.map(async (before, index) => ({
      ...before,
      update: updates[index] ?? { ok: false, tag: "no update" },
      written: await raw(before.name),
      frontmatterAfter: app.metadataCache.getFileCache(file(before.name))?.frontmatter ?? null,
    })),
  );
  recorder.dispose();
  const report = {
    notes: facts,
    listed: listed.ok
      ? listed.value.flatMap((note) => (note.path.startsWith(`${folder}/`) ? [note.path] : []))
      : listed,
    unreadable,
  };
  // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
  return JSON.parse(JSON.stringify(report)) as typeof report;
};
