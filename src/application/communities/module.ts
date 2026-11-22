import { communityType } from "../../domain/communities";
import { defineModule } from "../module";
import { COMMUNITIES_ERROR_TAG_KEYS } from "./errors";
import { communitiesDe } from "./i18n/de";
import { communitiesEn } from "./i18n/en";
import { COMMUNITIES_SECTION } from "./routes";
import { communitySelectionLayer } from "./selection";
import { describeCommunitiesError } from "./user-messages";

/**
 * The communities module's application side (ADR 0006): the community note type, its settings
 * section with the list, the selection service, its texts and its errors.
 */
export const communitiesModule = defineModule({
  name: "communities",
  catalog: { de: communitiesDe, en: communitiesEn },
  errors: { tags: COMMUNITIES_ERROR_TAG_KEYS, describe: describeCommunitiesError },
  noteTypes: [communityType],
  sections: [{ id: COMMUNITIES_SECTION, order: 100 }],
  services: communitySelectionLayer,
});
