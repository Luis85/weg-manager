import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { openRoute, type Memory } from "../../../support/communities/screen";
import { matterNote } from "../../../support/matters/fixture";
import { TG, closeAll, vault } from "../../../support/matters/screen";

afterEach(closeAll);

const t = de.week.decisions;

/** `count` regular matters (due in December) and `urgent` ones (due tomorrow), half in TG. */
const seed = (count: number, urgent: number) => (notes: Memory) => {
  const regular = Array.from({ length: count }, (_, n) => [
    `R${n}.md`,
    matterNote(10 + n, {
      outcome: `Regulär ${n}`,
      due_on: `2026-12-${String(10 + n)}`,
      next_step: `Schritt ${n}`,
      ...(n % 2 === 1 ? { community_id: TG } : {}),
    }),
    "",
  ]) as [string, Record<string, unknown>, string][];
  const pressing = Array.from({ length: urgent }, (_, n) => [
    `U${n}.md`,
    matterNote(40 + n, { outcome: `Dringend ${n}`, due_on: "2026-11-27" }),
    "",
  ]) as [string, Record<string, unknown>, string][];
  vault(...regular, ...pressing)(notes);
};

const openWeek = async (count: number, urgent: number) => {
  const screen = await openRoute({ name: "week" }, "week-screen", {
    seed: seed(count, urgent),
    today: "2026-11-26",
  });
  await screen.until(() => expect(screen.q("week-decisions")).toBeDefined());
  await screen.until(() =>
    expect(screen.all("decision").length + screen.all("decision-urgent").length).toBeGreaterThan(0),
  );
  return screen;
};

describe("the decisions of the week (PBI-14)", () => {
  it("chooses seven regular ones over both communities, the rest as backlog (criteria 1, 4)", async () => {
    const screen = await openWeek(10, 0);
    expect(screen.text("decisions-budget")).toBe(t.budget(7, 7));
    const titles = screen
      .all("decision")
      .map((card) => card.querySelector("p")?.textContent.trim());
    expect(titles).toEqual([
      "AW 010 Regulär 0",
      "TG 011 Regulär 1",
      "AW 012 Regulär 2",
      "TG 013 Regulär 3",
      "AW 014 Regulär 4",
      "TG 015 Regulär 5",
      "AW 016 Regulär 6",
    ]);
    expect(screen.all("decision")[0]?.textContent).toContain(t.reasons.due("2026-12-10"));
    expect(screen.all("decision")[0]?.textContent).toContain(t.nextStep("Schritt 0"));
    expect(screen.text("decisions-backlog")).toContain(t.backlogTitle(3));
    expect(screen.all("decision-backlog")).toHaveLength(3);
  });

  it("keeps nine urgent cases visible beside the seven regular ones (criterion 3)", async () => {
    const screen = await openWeek(10, 9);
    expect(screen.all("decision")).toHaveLength(7);
    expect(screen.all("decision-urgent")).toHaveLength(9);
    expect(screen.all("decision-urgent")[0]?.textContent).toContain(
      t.reasons["due-this-week"]("2026-11-27"),
    );
    expect(screen.text("decisions-budget")).toBe(t.budget(7, 7));
  });

  it("says that last week's focus items do not count yet (criterion 2)", async () => {
    const screen = await openWeek(1, 0);
    expect(screen.text("week-decisions")).toContain(t.focusPending);
  });
});
