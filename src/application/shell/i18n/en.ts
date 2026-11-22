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
    "rootFolder.invalid": ({ max }) =>
      `The root folder must be a vault folder path of at most ${max} characters, with "/" between folder names, without folder names that start with "." (Obsidian hides such folders) and without the characters * " \\ < > : | ?.`,
  },
  errors: {
    storage: {
      title: "Settings not saved",
      detail: "The settings file couldn't be written. Your input is kept. Save again.",
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
  },
  frame: {
    navigation: "Views",
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
