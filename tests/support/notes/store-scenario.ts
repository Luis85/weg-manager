import type { ScenarioContext, ScenarioProbe } from "./scenario-context";

/**
 * The probe plugin's `NoteStore` on a small vault, with the events each call fires, in order and
 * up to the step's fence (`Step`). Runs unchanged in real Obsidian (`note-store.e2e.ts`) and on
 * the double (`obsidian-double.test.ts`); both compare with `STORE_REPORT` (`fidelity.ts`).
 * `executeObsidian` serialises the function, so it uses only its arguments.
 */
export const storeScenario = async ({ app, plugins }: ScenarioContext) => {
  const { api: probe, recorder: makeRecorder } = (
    plugins as { readonly noteStoreProbe: ScenarioProbe }
  ).noteStoreProbe;
  const recorder = makeRecorder({
    vault: ["create", "modify", "delete", "rename"],
    cache: ["changed", "deleted"],
    cachePrefix: "metadataCache:",
  });
  const { fence, step } = recorder;
  const text = async (path: string) => {
    const file = app.vault.getFileByPath(path);
    return file === null ? null : app.vault.read(file);
  };
  const community = {
    folder: "WEG Manager/Gemeinschaften",
    name: "Ahornweg",
    frontmatter: { schema: "weg-manager.community/v1", name: "Ahornweg 12", tags: ["a", "b"] },
    body: "# Ahornweg\n",
  };

  // Notes from outside the plugin, as a person or an agent writes them.
  await app.vault.createFolder("Archiv");
  await app.vault.create(
    "Archiv/Fremd.md",
    "---\nschema: weg-manager.community/v1\nzeta: 1\nname: Alt\nunknown: kept\ngone: true\n---\n# Fremd\n\nText bleibt.\n",
  );
  await app.vault.create("Ohne Schema.md", "---\ntitle: Notiz\n---\nText\n");
  await app.vault.create("Kaputt.md", "---\nschema: [unclosed\n---\nText\n");
  await app.vault.create("Archiv/Kaputt.md", "---\nschema: [unclosed\n---\nText\n");
  await fence();

  const report = {
    create: await step(() => probe.create(community)),
    createdText: await text("WEG Manager/Gemeinschaften/Ahornweg.md"),
    clash: await step(() => probe.create(community)),
    list: await step(() => probe.list()),
    unreadable: await step(() => probe.unreadable("Archiv")),
    // On Linux the disk would take "ahornweg.md" beside "Ahornweg.md"; the store must not.
    caseClash: await step(() => probe.create({ ...community, name: "ahornweg" })),
    update: await step(() =>
      probe.update("Archiv/Fremd.md", { set: { name: "Neu", added: "x" }, remove: ["gone"] }),
    ),
    updatedText: await text("Archiv/Fremd.md"),
    unchanged: await step(() => probe.update("Archiv/Fremd.md", { set: { name: "Neu" } })),
    refused: await step(() => probe.update("Archiv/Fremd.md", { refuse: "Conflict" })),
    broken: await step(() => probe.update("Kaputt.md", { set: { a: 1 } })),
    rename: await step(() => probe.rename("/Archiv//Fremd.md", "Umbenannt")),
    renamedText: await text("Archiv/Umbenannt.md"),
    renameCase: await step(() => probe.rename("Archiv/Umbenannt.md", "UMBENANNT")),
    renameTaken: await step(() =>
      probe.rename("WEG Manager/Gemeinschaften/Ahornweg (2).md", "AHORNWEG"),
    ),
    trash: await step(() => probe.trash("WEG Manager/Gemeinschaften/Ahornweg (2).md")),
    readTrashed: await step(() => probe.read("WEG Manager/Gemeinschaften/Ahornweg (2).md")),
    finalList: await step(() => probe.list()),
    // A folder spelled in another case is the existing one: Linux would make a second.
    caseFolder: await step(() =>
      probe.create({ ...community, folder: "weg manager/GEMEINSCHAFTEN", name: "Linde" }),
    ),
    caseFolderChildren: app.vault.getRoot().children.filter((child) => /^weg/i.test(child.path))
      .length,
    // Write directly after create: the update decides on the text `vault.process` reads, so it
    // does not depend on whether the metadata cache has indexed the new note yet.
    writeAfterCreate: await step(async () => {
      const created = await probe.create({ ...community, name: "Sofort" });
      if (!created.ok) return created;
      return probe.update(created.value.path, { set: { name: "Gleich danach" } });
    }),
    writtenAfterCreate: await text("WEG Manager/Gemeinschaften/Sofort.md"),
  };
  recorder.dispose();
  // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
  return JSON.parse(JSON.stringify(report)) as typeof report;
};
