import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
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
import { vaultFacts } from "../../support/notes/scenarios";
import { STORE_REPORT } from "../../support/notes/store-fidelity";
import { storeScenario } from "../../support/notes/store-scenario";
import { cacheIdle, installConsoleSpy, pluginProblems } from "../support";

/** The report in the expectation's order where Obsidian keeps none, and the expectation. */
const ordered = (report: unknown, expected: unknown) =>
  [inExpectedOrder(report, expected), asWritten(expected)] as const;

/**
 * The fidelity check for the Obsidian double: the same scenarios and expectations as
 * `tests/unit/support/obsidian-double.test.ts`, here in a real Obsidian. The store runs from the
 * real adapter source inside the test-only probe plugin (`tests/e2e/probe-plugin/`), and every
 * step ends on the probe's event fence, never on a timer.
 */
describe("note store in Obsidian", function () {
  before(async function () {
    // The scenarios fence their own steps; this only lets Obsidian finish the vault's own notes.
    await cacheIdle();
  });

  it("finds the vault, metadata cache and file manager as the double models them", async function () {
    const input = {
      paths: NORMALIZE_CASES.map(([path]) => path),
      yaml: STRINGIFY_SAMPLE.value,
      text: PARSE_SAMPLE.text,
      closings: CLOSING_TEXTS,
    };
    const [report, expected] = ordered(
      await browser.executeObsidian(vaultFacts, input),
      VAULT_FACTS,
    );
    expect(report).toEqual(expected);
  });

  it("fires events in the order the double fires them", async function () {
    const [report, expected] = ordered(await browser.executeObsidian(orderScenario), ORDER_FACTS);
    expect(report).toEqual(expected);
  });

  it("creates, lists, updates, renames and trashes notes with the events the double fires", async function () {
    await installConsoleSpy();
    const [report, expected] = ordered(await browser.executeObsidian(storeScenario), STORE_REPORT);
    expect(report).toEqual(expected);
    expect(await pluginProblems()).toEqual([]);
  });
});
