// The public face of the matters domain (ADR 0006): other modules and layers import only this.
export {
  MATTER_KINDS,
  MATTER_STATUSES,
  TEXT_MAX_LENGTH,
  TOPIC_MAX_LENGTH,
  UNKNOWN_SOURCE,
  matterType,
  shownNumber,
  type MatterFields,
  type MatterKey,
  type MatterKind,
  type MatterStatus,
  type MatterValues,
} from "./matter-type";
export {
  MatterFieldIssue,
  checkMark,
  duplicateNumbers,
  matchesFilter,
  matterValues,
  nextNumber,
  validateMatter,
  type CheckMark,
  type MatterFilter,
  type MatterInput,
  type MatterRuleContext,
} from "./rules";
