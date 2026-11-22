import type { LogLevel, SettingsIssue } from "../../../domain/shell";
import type { ReadOnlySettingsError } from "../errors";
import type { UserMessageAction } from "../user-messages";

/** The UI languages of the plugin. Obsidian's language picks one (ADR 0005). */
export const LANGUAGES = ["de", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

/** The product name. It is not translated (ADR 0005); the ribbon icon's title is just this. */
export const PRODUCT_NAME = "WEG Manager";

/**
 * Where a user reports a problem with the plugin: its GitHub issues. The one place of the URL; a
 * message that asks for a report carries it as its `link`, and every renderer shows it as a link.
 */
export const ISSUES_URL = "https://github.com/Luis85/weg-manager/issues";

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
  readonly issues: IssueTexts;
  readonly errors: {
    /**
     * A failed save. `detailAfterClose` is the text once the view that held the user's input is
     * closed, where "your input is kept" is no longer true (`forClosedView`).
     */
    readonly storage: Text & { readonly detailAfterClose: string };
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
  /** The app frame's landmarks, for screen readers. */
  readonly frame: {
    readonly navigation: string;
    /** The navigation's one entry, which opens the settings screen. */
    readonly settings: string;
    readonly content: string;
    /** The view's own history (icon buttons, so these are their accessible names). */
    readonly back: string;
    readonly forward: string;
    /** The settings screen's navigation between its sections. */
    readonly settingsSections: string;
  };
  /** A route to something that no longer exists. */
  readonly notFound: { readonly title: string; readonly detail: string; readonly back: string };
};
