import { matterType, sourceType, todoType } from "../../domain/matters";
import { defineModule } from "../module";
import { MATTERS_ERROR_TAG_KEYS } from "./errors";
import { mattersDe } from "./i18n/de";
import { mattersEn } from "./i18n/en";
import { MattersRoute } from "./routes";
import { describeMattersError } from "./user-messages";

/**
 * The matters module's application side (ADR 0006, PBI-05): the matter note type, its screen with
 * the list, the filters and the form, its texts and its errors. It comes after `communities` and
 * `contacts`, whose records a matter refers to.
 */
export const mattersModule = defineModule({
  name: "matters",
  catalog: { de: mattersDe, en: mattersEn },
  errors: { tags: MATTERS_ERROR_TAG_KEYS, describe: describeMattersError },
  noteTypes: [matterType, todoType, sourceType],
  routes: [MattersRoute],
});
