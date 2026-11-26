import { PRODUCT_NAME, type ShellCatalog } from "./catalog";

/** English, sentence case as in Obsidian: first the cause, then the action. */
export const shellEn: ShellCatalog = {
  language: "en",
  issues: {
    "file.invalid": () => "The settings file contains no valid settings.",
    "schema.newer": ({ version }) =>
      `The settings come from a newer plugin version (schema version ${version}).`,
    "schema.invalid": () => "The schema version must be a positive whole number.",
    "migration.failed": ({ from }) =>
      `The settings from schema version ${from} couldn't be upgraded to the current version.`,
    "logLevel.unknown": ({ allowed }) => `The log level must be one of ${allowed.join(", ")}.`,
    "weekStart.unknown": () => "The start of the week must be a weekday from Monday to Sunday.",
    "weekMinutes.invalid": ({ min, max }) =>
      `The time target must be a whole number from ${min} to ${max} minutes.`,
    "weekDecisions.invalid": ({ min, max }) =>
      `The number of regular decisions must be a whole number from ${min} to ${max}.`,
    "acuteDays.invalid": ({ min, max }) =>
      `The deadline for acute problems must be a whole number from ${min} to ${max} days.`,
    "rootFolder.invalid": ({ max }) =>
      `The root folder must be a vault folder path of at most ${max} characters, with "/" between folder names, without folder names that start with "." (Obsidian hides such folders) and without the characters * " \\ < > : | ?.`,
  },
  errors: {
    storage: {
      title: "Settings not saved",
      detail: "The settings file couldn't be written. Your input is kept. Save again.",
      detailAfterClose:
        "The settings file couldn't be written, and your input was lost when the view closed. Open the view again and enter the change once more.",
    },
    readOnly: {
      title: "Settings are read-only",
      detail: {
        "newer-version": `The settings come from a newer version of ${PRODUCT_NAME}. Update the plugin to change them.`,
        unreadable:
          "The settings file can't be read. Default values apply and the file stays unchanged. Copy the diagnostics and report this on the plugin's GitHub page.",
      },
    },
    invalidSettings: { title: "Invalid input" },
    vaultRead: {
      title: "Can't read notes",
      detail: "The files in the vault couldn't be read. Try again.",
    },
    clipboard: {
      title: "Diagnostics not copied",
      detail: "The clipboard isn't available. Try again.",
    },
  },
  defect: {
    title: `Unexpected error in ${PRODUCT_NAME}`,
    detail: (incidentId) =>
      `The action was stopped (error code ${incidentId}). Copy the diagnostics and report the error with its code on the plugin's GitHub page. The report contains no content of your notes.`,
  },
  settingsReset: {
    title: "Settings partly reset",
    detail: (issues) => `${issues} Default values apply to these settings. Check the settings.`,
  },
  diagnosticsCopied: {
    title: "Diagnostics copied",
    detail:
      "Attach the report to your issue on the plugin's GitHub page. It contains no content of your notes.",
  },
  actions: {
    retry: "Try again",
    "open-settings": "Open settings",
    "copy-diagnostics": "Copy diagnostics",
  },
  commands: {
    openView: "Open view",
    copyDiagnostics: "Copy diagnostics",
  },
  settingsTab: {
    logLevel: {
      name: "Log level",
      desc: "How much the plugin writes to the developer console.",
      labels: { error: "Errors", warn: "Warnings", info: "Information", debug: "Details" },
    },
    weekStart: {
      name: "Start of the week",
      desc: "The day your weekly work begins. The week in the Week view counts from it.",
      labels: {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
      },
    },
    weekMinutes: {
      name: "Time target of the week",
      desc: "How long the weekly work should take, preparation and follow-up included.",
      minutes: (n) => `${n} minutes`,
    },
    weekDecisions: {
      name: "Regular decisions per week",
      desc: "How many decisions the week puts forward at most. Urgent ones come on top and stay visible.",
    },
    acuteDays: {
      name: "Deadline for acute problems",
      desc: "How many days before its date a matter counts as acute and appears beyond the regular selection.",
      days: (n) => (n === 0 ? "on the day itself" : n === 1 ? "1 day before" : `${n} days before`),
    },
  },
  frame: {
    navigation: "Views",
    settings: "Settings",
    content: "Content",
    back: "Back",
    forward: "Forward",
    settingsSections: "Settings sections",
  },
  notFound: {
    title: "Not found",
    detail: "What you wanted to open no longer exists. It may have been deleted or renamed.",
    back: "Go to the start page",
  },
};
