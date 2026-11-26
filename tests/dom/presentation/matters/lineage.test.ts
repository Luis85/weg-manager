import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { NoteStore } from "../../../../src/application/notes";
import { FOLDER, MANAGER, matterId, matterNote } from "../../../support/matters/fixture";
import { choose, closeAll, openMatters, vault } from "../../../support/matters/screen";

afterEach(closeAll);

const t = de.matters.history;

/** The matters screen with matter 5 and matter 6, both of community AW. */
const twoMatters = async () => {
  const screen = await openMatters(
    vault(
      ["A.md", matterNote(5, { outcome: "Lampe ersetzt" }), ""],
      ["B.md", matterNote(6, { outcome: "Lampe ersetzen", next_step: "Termin" }), ""],
    ),
  );
  await screen.until(() => expect(screen.names()).toHaveLength(2));
  return screen;
};

/** The frontmatter of the matter note `name` in the store, as it is now. */
const frontmatterOf = async (screen: Awaited<ReturnType<typeof twoMatters>>, name: string) => {
  const notes = await screen.runtime.runPromise(NoteStore.use((store) => store.list));
  return notes.find((note) => note.path === `${FOLDER}/${name}`)?.frontmatter;
};

/** Types `value` into the input `element` and lets the screen settle. */
const typeIn = async (
  screen: Awaited<ReturnType<typeof twoMatters>>,
  element: Element | null,
  value: string,
) => {
  if (!(element instanceof HTMLInputElement)) throw new Error("no input");
  element.value = value;
  element.dispatchEvent(new Event("input"));
  await screen.until(() => expect(element.value).toBe(value));
};

/** Fills part `index` of the split form: `outcome`, the manager, a next step. */
const fillPart = async (
  screen: Awaited<ReturnType<typeof twoMatters>>,
  index: number,
  outcome: string,
) => {
  const part = screen.all("split-part")[index];
  await typeIn(screen, part?.querySelector("[data-testid=part-outcome]") ?? null, outcome);
  await choose(part?.querySelector("[data-testid=part-responsible]") ?? undefined, MANAGER);
  await typeIn(screen, part?.querySelector("[data-testid=part-next]") ?? null, "Nachfragen");
};

/** Opens the history of the card whose outcome is `outcome`. */
const historyOf = async (screen: Awaited<ReturnType<typeof twoMatters>>, outcome: string) => {
  const card = screen.all("matter").find((each) => each.textContent.includes(outcome));
  const toggle = card?.querySelector("[data-testid=matter-history-toggle]") ?? undefined;
  await screen.click(toggle);
  await screen.until(() => expect(screen.q("matter-history")).toBeDefined());
};

describe("splitting a matter (PBI-06)", () => {
  it("creates the parts with new numbers and marks the source obsolete", async () => {
    const screen = await twoMatters();
    await historyOf(screen, "Lampe ersetzt");
    await screen.click(screen.q("split-start"));
    await fillPart(screen, 0, "Lampe Flur");
    await fillPart(screen, 1, "Lampe Keller");
    await screen.type("split-reason", "Zwei Lampen");
    await screen.click(screen.q("split-apply"));
    await screen.until(() => expect(screen.names()).toHaveLength(4));
    const source = await frontmatterOf(screen, "A.md");
    expect(source?.["status"]).toBe("obsolete");
    expect(source?.["split_into_ids"]).toEqual([matterId(1), matterId(2)]);
    await screen.until(() =>
      expect(screen.all("matter-lineage").map((line) => line.textContent.trim())).toEqual(
        expect.arrayContaining([
          de.matters.lineage.splitInto("AW 007, AW 008"),
          de.matters.lineage.splitFrom("AW 005"),
        ]),
      ),
    );
  });

  it("refuses a split without a reason and names the empty part", async () => {
    const screen = await twoMatters();
    await historyOf(screen, "Lampe ersetzt");
    await screen.click(screen.q("split-start"));
    await screen.click(screen.q("split-apply"));
    const text = screen.q("split-form")?.textContent ?? "";
    expect(text).toContain(t.splitIssues["reason.missing"]);
    expect(text).toContain(`${t.splitPart(1)}: ${t.splitIssues["outcome.missing"]}`);
    expect(screen.names()).toHaveLength(2);
  });
});

describe("merging a duplicate (PBI-07)", () => {
  it("takes the chosen value, keeps the target's by default, and closes the duplicate", async () => {
    const screen = await twoMatters();
    await historyOf(screen, "Lampe ersetzt");
    await screen.click(screen.q("merge-start"));
    await choose(screen.q("merge-duplicate"), matterId(6));
    await screen.until(() => expect(screen.q("merge-take-next_step")).toBeDefined());
    await screen.click(screen.q("merge-take-next_step"));
    await screen.type("merge-reason", "Doppelt erfasst");
    await screen.click(screen.q("merge-apply"));
    await screen.until(async () =>
      expect((await frontmatterOf(screen, "B.md"))?.["status"]).toBe("obsolete"),
    );
    const target = await frontmatterOf(screen, "A.md");
    expect(target?.["outcome"]).toBe("Lampe ersetzt");
    expect(target?.["next_step"]).toBe("Termin");
    expect(target?.["merged_from_ids"]).toEqual([matterId(6)]);
    expect((await frontmatterOf(screen, "B.md"))?.["merged_into_id"]).toBe(matterId(5));
    await screen.until(() => expect(screen.text("history")).toContain(t.related("AW 006")));
  });

  it("refuses a merge without a reason", async () => {
    const screen = await twoMatters();
    await historyOf(screen, "Lampe ersetzt");
    await screen.click(screen.q("merge-start"));
    await screen.click(screen.q("merge-apply"));
    expect(screen.q("merge-form")?.textContent).toContain(t.mergeIssues["reason.missing"]);
    expect((await frontmatterOf(screen, "B.md"))?.["status"]).toBe("open");
  });
});
