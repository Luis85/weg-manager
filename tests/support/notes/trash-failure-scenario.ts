import type { ScenarioContext, ScenarioProbe } from "./scenario-context";

/**
 * `fileManager.trashFile` when the system trash fails, and the `NoteStore` adapter on top of it.
 * Obsidian 1.15.1's own `trashFile` asks `vault.adapter.trashSystem` when the trash option is
 * "system" (the desktop default), and when that answers `false` it shows its own notice and
 * resolves `false`: it never rejects. The scenario makes `trashSystem` answer `false` on both
 * sides, so Obsidian's own `trashFile` code runs, and restores it and the option afterwards. Runs
 * unchanged in real Obsidian (`note-store.e2e.ts`) and on the double (`obsidian-double.test.ts`);
 * both compare with `TRASH_FAILURE_FACTS`. `executeObsidian` serialises the function, so it uses
 * only its arguments.
 */
export const trashFailureScenario = async ({ app, plugins }: ScenarioContext) => {
  const { api: probe, recorder: makeRecorder } = (
    plugins as { readonly noteStoreProbe: ScenarioProbe }
  ).noteStoreProbe;
  const recorder = makeRecorder({ vault: ["delete"], cache: ["deleted"] });
  type Adapter = { trashSystem: (path: string) => Promise<boolean> };
  type Config = { getConfig(key: string): unknown; setConfig(key: string, value: unknown): void };
  const adapter = app.vault.adapter as unknown as Adapter;
  const config = app.vault as unknown as Config;
  const trashSystem = adapter.trashSystem;
  const option = config.getConfig("trashOption");
  const path = "Bleibt.md";
  await app.vault.create(path, "---\na: 1\n---\n");
  await recorder.fence();
  const file = app.vault.getFileByPath(path);
  if (file === null) throw new Error(`no file at ${path}`);
  config.setConfig("trashOption", "system");
  adapter.trashSystem = () => Promise.resolve(false);
  try {
    const trashFile = await recorder.step(() => app.fileManager.trashFile(file));
    const listedAfterTrashFile = app.vault.getFileByPath(path) === file;
    const storeTrash = await recorder.step(() => probe.trash(path));
    const listedAfterStoreTrash = app.vault.getFileByPath(path) === file;
    const report = { trashFile, listedAfterTrashFile, storeTrash, listedAfterStoreTrash };
    // As plain JSON on both sides: `executeObsidian` turns `undefined` into `null` and sorts keys.
    return JSON.parse(JSON.stringify(report)) as typeof report;
  } finally {
    adapter.trashSystem = trashSystem;
    config.setConfig("trashOption", option);
    recorder.dispose();
  }
};

/**
 * What Obsidian 1.15.1 does, measured by `note-store.e2e.ts` (2026-11-22): `trashFile` resolves
 * `false`, nothing is deleted and no event fires; Obsidian shows its own notice ("„Bleibt.md“
 * konnte nicht in den Papierkorb des Systems verschoben werden …", not recorded here). The
 * adapter reports `NoteTrashError` and the note stays.
 */
export const TRASH_FAILURE_FACTS = {
  trashFile: { result: false, events: ["done"] },
  listedAfterTrashFile: true,
  storeTrash: { result: { ok: false, tag: "NoteTrashError" }, events: ["done"] },
  listedAfterStoreTrash: true,
};
