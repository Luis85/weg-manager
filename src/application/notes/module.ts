import { defineModule } from "../module";
import { NOTES_ERROR_TAG_KEYS } from "./errors";
import { notesDe } from "./i18n/de";
import { notesEn } from "./i18n/en";
import { DATA_ISSUES_SECTION } from "./routes";
import { describeNotesError } from "./user-messages";

/**
 * The notes module's application side (ADR 0006): its texts, its errors and the settings section
 * "Datenprobleme", after the features' sections. Its services are built from the host's adapters
 * (`appServicesLayer`), for the note types of every module.
 */
export const notesModule = defineModule({
  name: "notes",
  catalog: { de: notesDe, en: notesEn },
  errors: { tags: NOTES_ERROR_TAG_KEYS, describe: describeNotesError },
  sections: [{ id: DATA_ISSUES_SECTION, order: 900 }],
});
