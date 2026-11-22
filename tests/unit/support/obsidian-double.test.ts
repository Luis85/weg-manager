import { afterEach, describe, expect, it, vi } from "vitest";
import * as obsidian from "../../support/obsidian";
import { App, type TFile } from "../../support/obsidian";
import {
  CLOSING_TEXTS,
  NORMALIZE_CASES,
  PARSE_SAMPLE,
  STORE_REPORT,
  STRINGIFY_SAMPLE,
  VAULT_FACTS,
} from "../../support/notes/fidelity";
import { probeApi, type ProbeApi } from "../../support/notes/probe-api";
import { storeScenario, vaultFacts } from "../../support/notes/scenarios";
import { READINESS_FACTS, readinessScenario } from "../../support/readiness-scenario";

vi.mock("obsidian", () => import("@test/obsidian"));

/** The double indexes a macrotask after a write; a few milliseconds are plenty. */
const SETTLE_MS = 5;

const probes: ProbeApi[] = [];

afterEach(async () => {
  await Promise.all(probes.splice(0).map((probe) => probe.dispose()));
});

/**
 * The Obsidian double against what real Obsidian does: the same scenarios and expectations as
 * `tests/e2e/specs/note-store.e2e.ts` and `vault-ready.e2e.ts`, which run them in the app.
 */
describe("the Obsidian double", () => {
  it("behaves as Obsidian's vault, metadata cache and file manager", async () => {
    const input = {
      paths: NORMALIZE_CASES.map(([path]) => path),
      yaml: STRINGIFY_SAMPLE.value,
      text: PARSE_SAMPLE.text,
      closings: CLOSING_TEXTS,
    };
    const context = { app: new App(), obsidian, plugins: {} };
    expect(await vaultFacts(context as never, input, SETTLE_MS)).toEqual(VAULT_FACTS);
  });

  it("gives the Obsidian NoteStore adapter the results and events of real Obsidian", async () => {
    const app = new App();
    const api = probeApi(app as never);
    probes.push(api);
    const context = { app, obsidian, plugins: { noteStoreProbe: { api } } };
    expect(await storeScenario(context as never, SETTLE_MS)).toEqual(STORE_REPORT);
  });

  it("fires changed, resolve and resolved around an edit as Obsidian does", async () => {
    const app = new App();
    expect(await readinessScenario({ app } as never, SETTLE_MS)).toEqual(READINESS_FACTS);
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
