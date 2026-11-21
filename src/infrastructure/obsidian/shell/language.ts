import { getLanguage } from "obsidian";
import { languageFromCode } from "../../../application/messages";
import type { Language } from "../../../application/shell";

/**
 * The plugin's UI language from Obsidian's (`getLanguage()`, since 1.8.7): German stays German,
 * every other language gets English. Read once per plugin load; Obsidian restarts on a change.
 */
export const hostLanguage = (): Language => languageFromCode(getLanguage());
