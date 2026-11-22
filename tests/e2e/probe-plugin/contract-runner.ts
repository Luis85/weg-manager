import { Cause, Effect, Exit } from "effect";
import type { App } from "obsidian";
import { clashContract } from "../../support/notes/contract-clashes";
import { folderContract } from "../../support/notes/contract-folders";
import { readContract } from "../../support/notes/contract-reads";
import { writeContract } from "../../support/notes/contract-writes";
import { SkipCase, obsidianFixture, untilGone } from "./contract-fixture";
import { collectedCases, describe, type ContractCase } from "./contract-shim";

/** How one case of the contract ended in Obsidian. */
export type CaseResult =
  | { readonly name: string; readonly status: "passed"; readonly ms: number }
  | { readonly name: string; readonly status: "failed"; readonly message: string }
  | { readonly name: string; readonly status: "skipped"; readonly reason: string };

const CASE_TIMEOUT_MS = 15_000;

const outcome = (
  name: string,
  exit: Exit.Exit<unknown, unknown> | "timeout",
  ms: number,
): CaseResult => {
  if (exit === "timeout") return { name, status: "failed", message: "timed out" };
  if (Exit.isSuccess(exit)) return { name, status: "passed", ms };
  const error = Cause.squash(exit.cause);
  if (error instanceof SkipCase) return { name, status: "skipped", reason: error.message };
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return { name, status: "failed", message };
};

/**
 * Runs the NoteStore contract's read, write, clash and folder cases (`contract-*.ts`, through
 * `contract-shim.ts`) against the real Obsidian adapter in this vault, one after the other. Each
 * case starts on the vault as it was before the first: what a case left is deleted, and the
 * runner waits until the vault no longer lists it and the metadata cache has caught up.
 */
export const runContract = async (app: App): Promise<CaseResult[]> => {
  const fixtures: ReturnType<typeof obsidianFixture>[] = [];
  const make = () => {
    const fixture = obsidianFixture(app);
    fixtures.push(fixture);
    return fixture;
  };
  describe("NoteStore contract in Obsidian", () => {
    readContract(make);
    writeContract(make);
    clashContract(make);
    folderContract(make);
  });
  const cases: ContractCase[] = collectedCases();
  const settle = obsidianFixture(app);
  await settle.settle();
  const baseline = new Set(app.vault.getAllLoadedFiles().map((entry) => entry.path));
  const results: CaseResult[] = [];
  for (const contractCase of cases) {
    const started = performance.now();
    const exit = await Promise.race([
      Effect.runPromiseExit(contractCase.run()),
      new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), CASE_TIMEOUT_MS)),
    ]);
    results.push(outcome(contractCase.name, exit, Math.round(performance.now() - started)));
    for (const fixture of fixtures.splice(0)) fixture.dispose();
    // Back to the vault as it was: the outermost entries the case added, with their contents,
    // once the metadata cache has read what the case wrote (a file deleted before Obsidian has
    // read it makes Obsidian reject with ENOENT, unhandled).
    await settle.settle();
    const added = app.vault
      .getAllLoadedFiles()
      .filter((entry) => !baseline.has(entry.path) && baseline.has(entry.parent?.path ?? "/"));
    await Promise.all(added.map((entry) => app.vault.delete(entry, true)));
    await untilGone(
      app,
      added.map((entry) => entry.path),
    );
    await settle.settle();
  }
  settle.dispose();
  return results;
};
