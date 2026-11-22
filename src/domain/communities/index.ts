// The public face of the communities domain (ADR 0006): other modules and layers import only this.
export {
  COMMUNITY_COLORS,
  LABEL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  communityType,
  type CommunityColor,
  type CommunityFields,
  type CommunityKey,
  type CommunityValues,
} from "./community-type";
export { kindSuggestions, type KindPair } from "./kinds";
export {
  colorOwners,
  communityValues,
  duplicateShortCodes,
  firstFreeColor,
  normalizeShortCode,
  validateCommunity,
  CommunityFieldIssue,
  type CommunityInput,
} from "./rules";
export { isCommunityChoice, selectableIds, selectedCommunity } from "./selection";
