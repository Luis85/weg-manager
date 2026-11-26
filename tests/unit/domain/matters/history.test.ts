import { describe, expect, it } from "vitest";
import {
  HISTORY_HEADING,
  appendEntry,
  correctedIds,
  formatEntry,
  parseHistory,
  validateEntry,
  validateStatusChange,
  type HistoryEntry,
} from "../../../../src/domain/matters";

const CONTACT = "contact-9a1d2c3b-4e5f-4a6b-8c7d-0e1f2a3b4c5d";
const ENTRY: HistoryEntry = {
  id: "a1b2c3d4",
  occurred_on: "2026-11-20",
  text: "Anfrage per Mail an die Verwaltung",
  kind: "request",
  actor: "board",
  source: "Mail",
  recorded_on: "2026-11-21",
};
const LINE =
  "- 2026-11-20 Anfrage per Mail an die Verwaltung [kind:: request] [actor:: board] [source:: Mail] [recorded:: 2026-11-21] [id:: a1b2c3d4]";

describe("formatEntry", () => {
  it("writes one list item with inline fields, in a fixed order", () => {
    expect(formatEntry(ENTRY)).toBe(LINE);
  });

  it("writes an unknown day as ?, a status change's status and a correction's target", () => {
    expect(
      formatEntry({
        ...ENTRY,
        occurred_on: undefined,
        kind: "status_change",
        status: "done",
        corrects: "ffff0000",
        source: undefined,
        actor: CONTACT,
      }),
    ).toBe(
      `- ? Anfrage per Mail an die Verwaltung [kind:: status_change] [actor:: ${CONTACT}] [status:: done] [corrects:: ffff0000] [recorded:: 2026-11-21] [id:: a1b2c3d4]`,
    );
  });

  it("keeps a text from reading as a field: brackets become parentheses, lines one", () => {
    expect(formatEntry({ ...ENTRY, text: "Zitat [kind:: note]\nzweite Zeile" })).toContain(
      "- 2026-11-20 Zitat (kind:: note) zweite Zeile [kind:: request]",
    );
  });
});

describe("parseHistory", () => {
  it("reads the entries of the section, in file order, and nothing outside it", () => {
    const body = [
      "# Eigene Notizen",
      "- 2026-01-01 kein Verlauf [kind:: note] [actor:: board] [recorded:: 2026-01-01] [id:: 00000000]",
      "",
      HISTORY_HEADING,
      "",
      LINE,
      "- ? Antwort kam [kind:: reply] [actor:: board] [recorded:: 2026-11-22] [id:: b2c3d4e5]",
      "",
      "## Danach",
      "- 2026-12-01 auch kein Verlauf [kind:: note] [actor:: board] [recorded:: 2026-12-01] [id:: 11111111]",
    ].join("\n");
    expect(parseHistory(body)).toEqual([
      { kind: "entry", entry: ENTRY },
      {
        kind: "entry",
        entry: {
          id: "b2c3d4e5",
          occurred_on: undefined,
          text: "Antwort kam",
          kind: "reply",
          actor: "board",
          recorded_on: "2026-11-22",
        },
      },
    ]);
  });

  it("keeps a line it cannot read as it is, so a hand-written line stays visible", () => {
    const body = `${HISTORY_HEADING}\n\n- am Dienstag angerufen\n- 2026-11-20 ohne Felder\n`;
    expect(parseHistory(body)).toEqual([
      { kind: "unreadable", line: "- am Dienstag angerufen" },
      { kind: "unreadable", line: "- 2026-11-20 ohne Felder" },
    ]);
  });

  it("reads nothing from a body without the section", () => {
    expect(parseHistory("# Notizen\n\nText\n")).toEqual([]);
  });

  it("reads what formatEntry writes", () => {
    const entry: HistoryEntry = {
      ...ENTRY,
      kind: "status_change",
      status: "obsolete",
      corrects: "x1",
    };
    expect(parseHistory(`${HISTORY_HEADING}\n\n${formatEntry(entry)}\n`)).toEqual([
      { kind: "entry", entry },
    ]);
  });
});

describe("appendEntry", () => {
  it("adds the section at the end of a body without one", () => {
    expect(appendEntry("# Notizen\n\nText\n", ENTRY, "\n")).toBe(
      `# Notizen\n\nText\n\n${HISTORY_HEADING}\n\n${LINE}\n`,
    );
    expect(appendEntry("", ENTRY, "\n")).toBe(`${HISTORY_HEADING}\n\n${LINE}\n`);
  });

  it("adds the entry after the section's last one, before what follows it", () => {
    const body = `${HISTORY_HEADING}\n\n- erste [kind:: note] [actor:: board] [recorded:: 2026-11-01] [id:: 1]\n\n## Danach\nText\n`;
    expect(appendEntry(body, ENTRY, "\n")).toBe(
      `${HISTORY_HEADING}\n\n- erste [kind:: note] [actor:: board] [recorded:: 2026-11-01] [id:: 1]\n${LINE}\n\n## Danach\nText\n`,
    );
  });

  it("writes the note's line break", () => {
    expect(appendEntry("Text\r\n", ENTRY, "\r\n")).toBe(
      `Text\r\n\r\n${HISTORY_HEADING}\r\n\r\n${LINE}\r\n`,
    );
  });
});

describe("correctedIds", () => {
  it("names each entry another one corrects", () => {
    const corrected = correctedIds([
      { kind: "entry", entry: ENTRY },
      { kind: "entry", entry: { ...ENTRY, id: "z", corrects: "a1b2c3d4" } },
      { kind: "unreadable", line: "- x" },
    ]);
    expect([...corrected]).toEqual(["a1b2c3d4"]);
  });
});

describe("validateEntry", () => {
  it("needs a text in one line and a known day or none", () => {
    expect(validateEntry({ text: " ", occurred_on: "" })).toEqual(["text.missing"]);
    expect(validateEntry({ text: "x".repeat(501), occurred_on: "" })).toEqual(["text.invalid"]);
    expect(validateEntry({ text: "ok", occurred_on: "2026-02-30" })).toEqual([
      "occurred-on.invalid",
    ]);
    expect(validateEntry({ text: "ok", occurred_on: "" })).toEqual([]);
  });
});

describe("validateStatusChange", () => {
  it("needs a new status and a reason (PBI-08 criterion 1)", () => {
    expect(
      validateStatusChange({ from: "open", to: "open", reason: "x", source: "", done_on: "" }),
    ).toEqual(["status.unchanged"]);
    expect(
      validateStatusChange({ from: "open", to: "unclear", reason: " ", source: "", done_on: "" }),
    ).toEqual(["reason.missing"]);
    expect(
      validateStatusChange({
        from: "open",
        to: "unclear",
        reason: "Antwort widersprüchlich",
        source: "",
        done_on: "",
      }),
    ).toEqual([]);
  });

  it("needs a source to close a matter, and the done day for done", () => {
    expect(
      validateStatusChange({
        from: "open",
        to: "done",
        reason: "geliefert",
        source: "",
        done_on: "",
      }),
    ).toEqual(["source.missing", "done-on.missing"]);
    expect(
      validateStatusChange({
        from: "open",
        to: "obsolete",
        reason: "entfällt",
        source: "Protokoll",
        done_on: "",
      }),
    ).toEqual([]);
    expect(
      validateStatusChange({
        from: "open",
        to: "done",
        reason: "geliefert",
        source: "Mail",
        done_on: "2026-11-25",
      }),
    ).toEqual([]);
  });

  it("lets a closed matter be reopened with a reason (criterion 3)", () => {
    expect(
      validateStatusChange({
        from: "done",
        to: "open",
        reason: "Lampe wieder defekt",
        source: "",
        done_on: "",
      }),
    ).toEqual([]);
  });
});
