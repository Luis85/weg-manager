import { mkdirSync, writeFileSync } from "node:fs";
import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import type { CaseResult } from "../probe-plugin/contract-runner";
import { SKIP_REASONS } from "../probe-plugin/contract-skips";
import { cacheIdle, installConsoleSpy, pluginProblems } from "../support";

const CONTRACT = "NoteStore contract in Obsidian";

/**
 * How many cases the contract has (`tests/support/notes/contract-*.ts`), counted on the run that
 * wrote this: a contract that shrinks must be seen here too, not only a case that fails. A case
 * added to the contract raises it.
 */
const CASES = 58;

/**
 * The cases that need failing writes. The fixture makes the vault read-only with `chmod`, which
 * only works for a user that is not root (the GitHub runner is not, this file's `process` is the
 * runner's as the app's is). For root they are skipped, by name, with the reason.
 */
const FAIL_WRITES = [
  "create > fails with NoteWriteError when the vault rejects the write",
  "update > fails with NoteWriteError when the vault rejects the write",
  "trash > fails with NoteTrashError when the vault rejects it, and keeps the note",
  "rename > fails with NoteWriteError when the vault rejects it",
];
const AS_ROOT = process.getuid?.() === 0;

/**
 * The cases that need a hook a real app cannot give, by name, with the hook. They still run
 * against the in-memory adapter and the Obsidian adapter on the double
 * (`tests/unit/infrastructure/notes/`); the case-insensitive disk of Windows and macOS is not
 * Linux's at all, so that run of the contract is the double's alone.
 */
const SKIPPED: Readonly<Record<string, string>> = {
  ...Object.fromEntries(
    AS_ROOT ? FAIL_WRITES.map((name) => [name, SKIP_REASONS.failWritesAsRoot]) : [],
  ),
  "list > fails with VaultReadError when the vault cannot be read": SKIP_REASONS.failReads,
  "read > fails with VaultReadError when the vault cannot be read": SKIP_REASONS.failReads,
  "unreadable > fails with VaultReadError when the vault cannot be read": SKIP_REASONS.failReads,
  "create > completes a create that has started, also when interrupted": SKIP_REASONS.holdWrites,
  "update > fails with NoteNotFoundError when the note is deleted before the write":
    SKIP_REASONS.holdWrites,
  "update > fails with NoteNotFoundError at the first attempt when the note is deleted outside and the host has not noticed":
    SKIP_REASONS.unnoticed,
  "update > completes an update that has started, also when interrupted": SKIP_REASONS.holdWrites,
};

/**
 * The NoteStore contract (`tests/support/notes/contract-*.ts`) in real Obsidian: its read, write,
 * clash and folder cases, run by the probe plugin against the real adapter in this vault
 * (`tests/e2e/probe-plugin/contract-runner.ts`). Every case passes or is one of `SKIPPED`.
 */
describe("the NoteStore contract in Obsidian", function () {
  this.timeout(180_000);

  it("holds for the real adapter, case for case", async function () {
    await cacheIdle();
    await installConsoleSpy();
    const started = Date.now();
    const results = await browser.executeObsidian(async ({ plugins }) => {
      const probe = (plugins as unknown as { noteStoreProbe?: { contract(): Promise<unknown> } })
        .noteStoreProbe;
      if (probe === undefined) throw new Error("the probe plugin is not loaded");
      return probe.contract();
    });
    const cases = results as CaseResult[];
    expect(cases.length).toBe(CASES);
    const named = (result: CaseResult) => result.name.replace(`${CONTRACT} > `, "");
    mkdirSync("reports/e2e", { recursive: true });
    writeFileSync(
      "reports/e2e/note-store-contract.json",
      `${JSON.stringify({ ms: Date.now() - started, cases }, null, 2)}\n`,
    );
    expect(cases.filter((result) => result.status === "failed")).toEqual([]);
    expect(
      Object.fromEntries(
        cases.flatMap((result) =>
          result.status === "skipped" ? [[named(result), result.reason]] : [],
        ),
      ),
    ).toEqual(SKIPPED);
    expect(cases.filter((result) => result.status === "passed").length).toBe(
      cases.length - Object.keys(SKIPPED).length,
    );
    expect(await pluginProblems()).toEqual([]);
  });
});
