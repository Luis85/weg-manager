// The public face of the week domain (ADR 0006): other modules and layers import only this.
export {
  BRIEFING_MAX_SENTENCES,
  addDays,
  weekBriefing,
  weekStartOf,
  type Briefing,
  type BriefingInput,
  type Coverage,
  type DeadlineState,
  type Sentence,
  type SentenceCode,
} from "./briefing";
export { weekType, type WeekFields } from "./week-type";
