import { PRODUCT_NAME, type Catalog } from "./catalog";

/** English, sentence case as in Obsidian: first the cause, then the action. */
export const en: Catalog = {
  language: "en",
  defaultGreeting: `Hello from ${PRODUCT_NAME}`,
  issues: {
    "file.invalid": () => "The settings file contains no valid settings.",
    "schema.newer": ({ version }) =>
      `The settings come from a newer plugin version (schema version ${version}).`,
    "schema.invalid": () => "The schema version must be a positive whole number.",
    "greeting.length": ({ max }) => `The greeting must be 1 to ${max} characters long.`,
    "logLevel.unknown": ({ allowed }) => `The log level must be one of ${allowed.join(", ")}.`,
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
          "The settings file can't be read. Default values apply and the file stays unchanged. Copy the diagnostics for support.",
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
      `The action was stopped (error code ${incidentId}). Copy the diagnostics and send them to support with the error code.`,
  },
  settingsReset: {
    title: "Settings partly reset",
    detail: (issues) => `${issues} Default values apply to these settings. Check the settings.`,
  },
  diagnosticsCopied: {
    title: "Diagnostics copied",
    detail: "Paste the report into your support request.",
  },
  actions: {
    retry: "Try again",
    "open-settings": "Open settings",
    "copy-diagnostics": "Copy diagnostics",
  },
  commands: {
    openView: "Open view",
    showGreeting: "Show greeting",
    copyDiagnostics: "Copy diagnostics",
  },
  settingsTab: {
    greeting: { name: "Greeting", desc: "Text that the “Show greeting” command shows." },
    logLevel: {
      name: "Log level",
      desc: "How much the plugin writes to the developer console.",
      labels: { error: "Errors", warn: "Warnings", info: "Information", debug: "Details" },
    },
  },
  panel: {
    markdownFiles: (count) =>
      count === 1 ? "1 Markdown file in the vault" : `${count} Markdown files in the vault`,
    counting: "Counting notes…",
  },
  greetingForm: { label: "Greeting", save: "Save" },
  about: {
    title: `About ${PRODUCT_NAME}`,
    description: "Tools for the advisory boards of condominium owners' associations.",
    button: "About",
    body: "Copy the version, platform and log with the “Copy diagnostics” command.",
  },
};
