import { afterEach, describe, expect, it, vi } from "vitest";
import * as obsidian from "../../support/obsidian";
import { App, type TFile } from "../../support/obsidian";
import { asObsidian } from "../../support/obsidian/real";
import { DIFFICULT_FACTS } from "../../support/notes/difficult-fidelity";
import { DIFFICULT_NOTES } from "../../support/notes/difficult-notes";
import { difficultScenario } from "../../support/notes/difficult-scenario";
import { doubleProbe } from "../../support/notes/double-probe";
import { asWritten, inExpectedOrder } from "../../support/notes/event-order";
import {
  CLOSING_TEXTS,
  NORMALIZE_CASES,
  PARSE_SAMPLE,
  STRINGIFY_SAMPLE,
  VAULT_FACTS,
} from "../../support/notes/fidelity";
import { ORDER_FACTS } from "../../support/notes/order-fidelity";
import { orderScenario } from "../../support/notes/order-scenario";
import type { ScenarioProbe } from "../../support/notes/scenario-context";
import { vaultFacts } from "../../support/notes/scenarios";
import { STORE_REPORT } from "../../support/notes/store-fidelity";
import { storeScenario } from "../../support/notes/store-scenario";
import { VANISHED_FACTS, vanishedScenario } from "../../support/notes/vanished-scenario";
import { READINESS_FACTS, readinessScenario } from "../../support/readiness-scenario";

vi.mock("obsidian", () => import("@test/obsidian"));

const probes: ScenarioProbe[] = [];

afterEach(async () => {
  await Promise.all(probes.splice(0).map((probe) => probe.api.dispose()));
});

/** The context `browser.executeObsidian` hands a scenario, on a fresh double. */
const onDouble = () => {
  const app = new App();
  const probe = doubleProbe(app);
  probes.push(probe);
  return { app: asObsidian(app), obsidian, plugins: { noteStoreProbe: probe } };
};

/** The report in the expectation's order where Obsidian keeps none, and the expectation. */
const ordered = (report: unknown, expected: unknown) =>
  [inExpectedOrder(report, expected), asWritten(expected)] as const;

/**
 * The Obsidian double against what real Obsidian does: the same scenarios and expectations as
 * `tests/e2e/specs/note-store.e2e.ts`, `difficult-frontmatter.e2e.ts` and `vault-ready.e2e.ts`,
 * which run them in the app. Every step ends on the recorder's fence, never on a timer.
 */
describe("the Obsidian double", () => {
  it("behaves as Obsidian's vault, metadata cache and file manager", async () => {
    const input = {
      paths: NORMALIZE_CASES.map(([path]) => path),
      yaml: STRINGIFY_SAMPLE.value,
      text: PARSE_SAMPLE.text,
      closings: CLOSING_TEXTS,
    };
    const [report, expected] = ordered(await vaultFacts(onDouble(), input), VAULT_FACTS);
    expect(report).toEqual(expected);
  });

  it("gives the Obsidian NoteStore adapter the results and events of real Obsidian", async () => {
    const [report, expected] = ordered(await storeScenario(onDouble()), STORE_REPORT);
    expect(report).toEqual(expected);
  });

  it("fires events in Obsidian's order around writes, renames and trashes", async () => {
    const [report, expected] = ordered(await orderScenario(onDouble()), ORDER_FACTS);
    expect(report).toEqual(expected);
  });

  it("reads and writes notes with difficult frontmatter as Obsidian does", async () => {
    const [report, expected] = ordered(
      await difficultScenario(onDouble(), DIFFICULT_NOTES),
      DIFFICULT_FACTS,
    );
    expect(report).toEqual(expected);
  });

  it("fires changed, resolve and resolved around an edit as Obsidian does", async () => {
    const [report, expected] = ordered(await readinessScenario(onDouble()), READINESS_FACTS);
    expect(report).toEqual(expected);
  });
});

describe("the Obsidian double's deleted-outside window", () => {
  it("rejects process as Obsidian does for a file deleted outside that is still listed", async () => {
    expect(await vanishedScenario(onDouble())).toEqual(VANISHED_FACTS);
  });

  it("lists a vanished file until the watcher reports it, then does not", async () => {
    const app = new App();
    app.vault.seedFile("A.md", "x");
    const file = app.vault.getFileByPath("A.md");
    if (file === null) throw new Error("no A.md");
    app.vault.vanish("A.md");
    expect(app.vault.getFileByPath("A.md")).toBe(file);
    await expect(app.vault.read(file)).rejects.toMatchObject({ code: "ENOENT" });
    expect(() => app.vault.vanish("B.md")).toThrow("no file at B.md");
    app.vault.remove(file);
    expect(app.vault.getFileByPath("A.md")).toBeNull();
  });
});

/** What a test can do to the double that Obsidian could do too: never index a file. */
describe("the Obsidian double's withheld index", () => {
  it("never indexes a withheld file, however often it changes, until it is restored", async () => {
    const app = new App();
    const events: string[] = [];
    app.metadataCache.on("changed", (file: unknown) =>
      events.push(`changed ${(file as TFile).path}`),
    );
    app.metadataCache.withholdIndex("Nie.md");
    app.vault.seedFile("Nie.md", "---\na: 1\n---\n");
    app.vault.seedFile("Da.md", "---\na: 1\n---\n");
    await app.metadataCache.whenIndexed();
    const never = app.vault.getFileByPath("Nie.md");
    if (never === null) throw new Error("no Nie.md");
    expect(app.metadataCache.getFileCache(never)).toBeNull();
    expect(events).toEqual(["changed Da.md"]);
    app.vault.seedFile("Nie.md", "---\na: 2\n---\n");
    await app.metadataCache.whenIndexed();
    expect(app.metadataCache.getFileCache(never)).toBeNull();

    app.metadataCache.restoreIndex("Nie.md");
    await app.metadataCache.whenIndexed();
    expect(app.metadataCache.getFileCache(never)?.frontmatter).toEqual({ a: 2 });
    expect(events).toEqual(["changed Da.md", "changed Nie.md"]);
  });

  it("lets a cold start skip a withheld file and wakes whenIndexed all the same", async () => {
    const app = new App();
    app.vault.seedFile("Nie.md", "---\na: 1\n---\n");
    app.vault.seedFile("Da.md", "---\na: 1\n---\n");
    await app.metadataCache.whenIndexed();
    app.metadataCache.withholdIndex("Nie.md");
    app.metadataCache.startCold();
    await app.metadataCache.whenIndexed();
    const cached = app.vault
      .getMarkdownFiles()
      .filter((file) => app.metadataCache.getFileCache(file) !== null)
      .map((file) => file.path);
    expect(cached).toEqual(["Da.md"]);
  });
});
