import { weekType } from "../../domain/week";
import { defineModule } from "../module";
import { WEEK_ERROR_TAG_KEYS } from "./errors";
import { weekDe } from "./i18n/de";
import { weekEn } from "./i18n/en";
import { WeekRoute } from "./routes";
import { describeWeekError } from "./user-messages";

/**
 * The week module's application side (ADR 0006, PBI-13): the week note type and the week screen
 * with the briefing, the deadlines of the next 14 days and the board's own to-dos. It comes after
 * `matters`, whose matters, to-dos and sources the briefing is computed from.
 */
export const weekModule = defineModule({
  name: "week",
  catalog: { de: weekDe, en: weekEn },
  errors: { tags: WEEK_ERROR_TAG_KEYS, describe: describeWeekError },
  noteTypes: [weekType],
  routes: [WeekRoute],
});
