// The public face of the communities domain (ADR 0006): other modules and layers import only this.
export {
  COMMUNITY_COLORS,
  COMMUNITY_KEYS,
  LABEL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  communityType,
  type CommunityColor,
  type CommunityFields,
  type CommunityKey,
  type CommunityValues,
} from "./community-type";
export { communityFileName, followsName } from "./file-name";
export { kindSuggestions, type KindPair } from "./kinds";
export {
  colorsInUse,
  communityValues,
  duplicateShortCodes,
  editedValues,
  normalizeShortCode,
  validateCommunity,
  CommunityFieldIssue,
  type CommunityIssueCode,
  type CommunityInput,
} from "./rules";
export {
  isCommunityChoice,
  selectableIds,
  selectedCommunity,
  type SelectionCandidate,
} from "./selection";
