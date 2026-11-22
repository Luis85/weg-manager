import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import {
  CLOSING_TEXTS,
  NORMALIZE_CASES,
  PARSE_SAMPLE,
  STORE_REPORT,
  STRINGIFY_SAMPLE,
  VAULT_FACTS,
} from "../../support/notes/fidelity";
import { storeScenario, vaultFacts } from "../../support/notes/scenarios";
import { cacheIdle, installConsoleSpy, pluginProblems } from "../support";

/** Long enough for Obsidian's metadata cache to index a write (about 3 ms on a dev machine). */
const SETTLE_MS = 400;

/**
 * The fidelity check for the Obsidian double: the same scenarios and expectations as
 * `tests/unit/support/obsidian-double.test.ts`, here in a real Obsidian. The store runs from the
 * real adapter source inside the test-only probe plugin (`tests/e2e/probe-plugin/`).
 */
describe("note store in Obsidian", function () {
  before(async function () {
    // The first scenario records every event for a stretch; the vault's own notes must not still
    // be indexing in the background then (seen once on a loaded machine: three late `changed`).
    await cacheIdle();
  });

  it("finds the vault, metadata cache and file manager as the double models them", async function () {
    const input = {
      paths: NORMALIZE_CASES.map(([path]) => path),
      yaml: STRINGIFY_SAMPLE.value,
      text: PARSE_SAMPLE.text,
      closings: CLOSING_TEXTS,
    };
    const facts = await browser.executeObsidian(vaultFacts, input, SETTLE_MS);
    expect(facts).toEqual(VAULT_FACTS);
  });

  it("creates, lists, updates, renames and trashes notes with the events the double fires", async function () {
    await installConsoleSpy();
    const report = await browser.executeObsidian(storeScenario, SETTLE_MS);
    expect(report).toEqual(STORE_REPORT);
    expect(await pluginProblems()).toEqual([]);
  });
});
