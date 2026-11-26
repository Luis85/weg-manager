/**
 * The German catalog the specs read user-visible texts from, so a wording change touches the
 * catalog and not twenty checks. It is plain data (`src/application/messages.ts` imports only the
 * application layer, which has no `obsidian`, DOM or Vue import), so the specs, which run in Node,
 * can load it. Literal sentences stay in `language.e2e.ts`, whose point is the wording itself.
 */
import { de, en } from "../../src/application/messages";

export { de };

/** The names of the settings tab's rows in order: the log level, then the week (PBI-13). */
export const settingNames = (language: "de" | "en" = "de") => {
  const tab = (language === "de" ? de : en).shell.settingsTab;
  return [
    tab.logLevel.name,
    tab.weekStart.name,
    tab.weekMinutes.name,
    tab.weekDecisions.name,
    tab.acuteDays.name,
  ];
};
