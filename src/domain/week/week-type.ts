import { date, defineNoteType, required } from "../notes";

/**
 * The week note, `weg-manager.week/v1` (PBI-13; contract page `docs/contracts/DV-06 - Woche v1.md`):
 * the briefing of one week as the board member edited it, the text in the note's body. The week is
 * named by its first day (`week_of`, after the setting `weekStart`); new notes go to
 * `<rootFolder>/Wochen/`, named by that day.
 */
export const weekType = defineNoteType({
  type: "week",
  version: 1,
  folder: "Wochen",
  fields: { week_of: required(date()) },
  migrations: {},
});

export type WeekFields = typeof weekType.fields;
