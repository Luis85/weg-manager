import { afterEach, describe, expect, it } from "vitest";
import { de } from "../../../../src/application/messages";
import { NoteStore } from "../../../../src/application/notes";
import {
  FOLDER,
  TODO_FOLDER,
  matterId,
  matterNote,
  todoNote,
} from "../../../support/matters/fixture";
import { choose, closeAll, openMatters, vault } from "../../../support/matters/screen";
import type { Memory } from "../../../support/communities/screen";

afterEach(closeAll);

const t = de.matters.todos;

/** Matters 5 (no to-do) and 6 (with an open to-do), and the to-dos `todos` (title → extra). */
const seed =
  (todos: Record<string, Record<string, unknown>> = {}) =>
  (notes: Memory) => {
    vault(
      ["A.md", matterNote(5, { outcome: "Lampe ersetzt", next_step: "Firma anrufen" }), ""],
      ["B.md", matterNote(6, { outcome: "Tür repariert" }), ""],
    )(notes);
    notes.seed(
      `${TODO_FOLDER}/Angebot prüfen.md`,
      todoNote(1, "Angebot prüfen", { matter_id: matterId(6) }),
    );
    Object.entries(todos).forEach(([title, extra], at) =>
      notes.seed(`${TODO_FOLDER}/${title}.md`, todoNote(10 + at, title, extra)),
    );
  };

/** The matters screen on the to-dos segment. */
const openTodos = async (todos?: Record<string, Record<string, unknown>>) => {
  const screen = await openMatters(seed(todos));
  await screen.until(() => expect(screen.names()).toHaveLength(2));
  await screen.click(screen.q("segment-todos"));
  await screen.until(() => expect(screen.q("todos-screen")).toBeDefined());
  return screen;
};

const titles = (screen: Awaited<ReturnType<typeof openTodos>>, group: string) =>
  [...(screen.q(`todos-${group}`)?.querySelectorAll("[data-testid=todo-name]") ?? [])].map((each) =>
    each.textContent.trim(),
  );

const frontmatterOf = async (screen: Awaited<ReturnType<typeof openTodos>>, path: string) => {
  const notes = await screen.runtime.runPromise(NoteStore.use((store) => store.list));
  return notes.find((note) => note.path === path)?.frontmatter;
};

describe("the to-dos (PBI-10)", () => {
  it("switches to the to-dos and adds one by quick entry, grouped this week", async () => {
    const screen = await openTodos();
    expect(screen.q("segment-todos")?.getAttribute("aria-pressed")).toBe("true");
    expect(screen.q("matter-add")).toBeUndefined();
    expect(titles(screen, "later")).toEqual(["Angebot prüfen"]);
    await screen.type("todo-quick-title", "Rechnung prüfen");
    await screen.type("todo-quick-due", "2026-11-27");
    await screen.click(screen.q("todo-quick-add"));
    await screen.until(() => expect(titles(screen, "week")).toEqual(["Rechnung prüfen"]));
    expect(await frontmatterOf(screen, `${TODO_FOLDER}/Rechnung prüfen.md`)).toMatchObject({
      status: "open",
      responsible: "board",
      due_on: "2026-11-27",
    });
    expect((screen.q("todo-quick-title") as HTMLInputElement).value).toBe("");
  });

  it("refuses a quick entry without a title", async () => {
    const screen = await openTodos();
    await screen.click(screen.q("todo-quick-add"));
    expect(screen.q("todo-quick")?.textContent).toContain(t.missing.title);
  });

  it("lists an open matter without a to-do and adds one for it (criterion 4)", async () => {
    const screen = await openTodos();
    const listed = () => screen.all("clarification-matter").map((each) => each.textContent);
    expect(listed()).toHaveLength(1);
    expect(listed()[0]).toContain("Lampe ersetzt");
    await screen.click(screen.q("clarification-add"));
    await screen.until(() => expect(screen.q("todo-form")).toBeDefined());
    expect((screen.q("todo-title") as HTMLInputElement).value).toBe("Firma anrufen");
    expect((screen.q("todo-matter_id") as HTMLSelectElement).value).toBe(matterId(5));
    await screen.click(screen.q("todo-save"));
    await screen.until(() => expect(screen.q("clarification-none")).toBeDefined());
  });

  it("marks a to-do done and leaves its matter open (criterion 3)", async () => {
    const screen = await openTodos();
    await screen.click(screen.q("todo-done"));
    await screen.until(async () =>
      expect((await frontmatterOf(screen, `${TODO_FOLDER}/Angebot prüfen.md`))?.["status"]).toBe(
        "done",
      ),
    );
    expect((await frontmatterOf(screen, `${FOLDER}/B.md`))?.["status"]).toBe("open");
    await screen.until(() =>
      expect(screen.q("todos-closed")?.textContent).toContain("Angebot prüfen"),
    );
    expect(screen.all("clarification-matter")).toHaveLength(2);
  });

  it("refuses to wait without a reason and a follow-up date (criterion 2)", async () => {
    const screen = await openTodos();
    await screen.click(screen.q("todo-edit"));
    await screen.until(() => expect(screen.q("todo-form")).toBeDefined());
    await choose(screen.q("todo-status"), "waiting");
    await screen.click(screen.q("todo-save"));
    await screen.until(() =>
      expect(screen.q("todo-form")?.textContent).toContain(
        t.issues["reason.missing"]({ key: "reason", code: "reason.missing" }, t.fields.reason),
      ),
    );
    expect(screen.q("todo-form")?.textContent).toContain(
      t.issues["follow-up.missing"](
        { key: "follow_up_on", code: "follow-up.missing" },
        t.fields.follow_up_on,
      ),
    );
    expect((await frontmatterOf(screen, `${TODO_FOLDER}/Angebot prüfen.md`))?.["status"]).toBe(
      "open",
    );
  });

  it("shows a matter's to-dos in its history panel", async () => {
    const screen = await openMatters(seed());
    await screen.until(() => expect(screen.names()).toHaveLength(2));
    const card = screen.all("matter").find((each) => each.textContent.includes("Tür repariert"));
    await screen.click(card?.querySelector("[data-testid=matter-history-toggle]") ?? undefined);
    await screen.until(() =>
      expect(screen.q("matter-todo")?.textContent).toContain("Angebot prüfen"),
    );
  });
});
