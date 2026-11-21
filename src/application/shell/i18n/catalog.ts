import type { LogLevel, SettingsIssue } from "../../../domain/shell";
import type { ReadOnlySettingsError } from "../errors";
import type { UserMessageAction } from "../user-messages";

/** The UI languages of the plugin. Obsidian's language picks one (ADR 0005). */
export const LANGUAGES = ["de", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

/** The product name. It is not translated (ADR 0005); the ribbon icon's title is just this. */
export const PRODUCT_NAME = "WEG Manager";

type Text = { readonly title: string; readonly detail: string };

/** One sentence per domain issue code; the issue's data fills the parameters. */
type IssueTexts = {
  readonly [Code in SettingsIssue["code"]]: (
    issue: Extract<SettingsIssue, { code: Code }>,
  ) => string;
};

/**
 * Every text of the shell the user sees, for one language: the shell's part of the app's `Catalog`
 * (`src/application/messages.ts`). Both languages are typed against it, so a key missing in one
 * language fails typecheck. Texts with parameters are functions.
 */
export type ShellCatalog = {
  /** The UI language of this catalog; the shell owns the UI-language mechanism (ADR 0005). */
  readonly language: Language;
  /** Shown while the greeting is not customised. */
  readonly defaultGreeting: string;
  readonly issues: IssueTexts;
  readonly errors: {
    readonly storage: Text;
    readonly readOnly: {
      readonly title: string;
      readonly detail: Readonly<Record<ReadOnlySettingsError["reason"], string>>;
    };
    readonly invalidSettings: { readonly title: string };
    readonly vaultRead: Text;
    readonly clipboard: Text;
  };
  readonly defect: { readonly title: string; detail(incidentId: string): string };
  readonly settingsReset: { readonly title: string; detail(issues: string): string };
  readonly diagnosticsCopied: Text;
  readonly actions: Readonly<Record<UserMessageAction, string>>;
  readonly commands: {
    readonly openView: string;
    readonly showGreeting: string;
    readonly copyDiagnostics: string;
  };
  readonly settingsTab: {
    readonly logLevel: {
      readonly name: string;
      readonly desc: string;
      /** Dropdown labels; the stored values stay `error`, `warn`, `info`, `debug`. */
      readonly labels: Readonly<Record<LogLevel, string>>;
    };
  };
  readonly panel: { markdownFiles(count: number): string; readonly counting: string };
  readonly greetingForm: { readonly label: string; readonly save: string };
  readonly about: {
    readonly title: string;
    readonly description: string;
    readonly button: string;
    readonly body: string;
  };
};
