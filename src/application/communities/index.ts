// The public face of the communities module's application layer (ADR 0006): other layers and the
// composition files import only this.
export { InvalidCommunityError, type CommunitiesError } from "./errors";
export type { CommunitiesCatalog } from "./i18n/catalog";
export { communitiesDe } from "./i18n/de";
export { describeCommunityIssue } from "./i18n/describe";
export { communitiesEn } from "./i18n/en";
export {
  canChangeShortCode,
  shownName,
  toCommunityList,
  type Community,
  type CommunityNoteIssue,
} from "./list";
export { COMMUNITY_SETTINGS, CommunitiesRoute } from "./routes";
export {
  CommunitySelectionService,
  communitySelection,
  communitySelectionChanges,
  communitySelectionLayer,
  selectCommunity,
  type CommunitySelection,
} from "./selection";
export type { CommunitiesServices } from "./services";
export {
  COMMUNITIES_FOLDER,
  communityList,
  communityListChanges,
  createCommunity,
  deleteCommunity,
  updateCommunity,
} from "./use-cases";
export { describeCommunitiesError, isCommunitiesError } from "./user-messages";
