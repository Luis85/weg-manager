import { browser, expect } from "@wdio/globals";
import { ROOT } from "./support";

/**
 * Helpers for the community specs. Code passed to `executeObsidian` is serialised and runs inside
 * Obsidian, so it takes its values as arguments.
 */

export const FOLDER = "WEG Manager/Gemeinschaften";

/** A community note's text as a person or an agent writes it. */
export const communityText = (fields: Readonly<Record<string, string>>, body = ""): string =>
  `---\n${Object.entries(fields)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")}\n---\n${body}`;

/** A valid community note's fields; `n` picks its id. */
export const community = (n: number, extra: Readonly<Record<string, string>> = {}) => ({
  schema: "weg-manager.community/v1",
  id: `community-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
  name: `Gemeinschaft ${n}`,
  short_code: `G${n}`,
  color: "teal",
  kind: "WEG",
  unit_label: "Einheiten",
  ...extra,
});

/** The text of a vault file, or `null` when there is none. */
export const fileText = (path: string) =>
  browser.executeObsidian(async ({ app }, file) => {
    if (!(await app.vault.adapter.exists(file))) return null;
    return app.vault.adapter.read(file);
  }, path);

/** Every Markdown file under `folder`, sorted. */
export const filesIn = (folder: string) =>
  browser.executeObsidian(
    ({ app }, prefix) =>
      app.vault
        .getMarkdownFiles()
        .map((file) => file.path)
        .filter((path) => path.startsWith(`${prefix}/`))
        .toSorted(),
    folder,
  );

/**
 * Writes a note as another program would (Sync, an editor, an agent): through the vault, creating
 * its folder when missing, replacing the text of an existing one.
 */
export const writeNote = (path: string, text: string) =>
  browser.executeObsidian(
    async ({ app }, file, content) => {
      const existing = app.vault.getFileByPath(file);
      if (existing !== null) {
        await app.vault.modify(existing, content);
        return;
      }
      const folder = file.slice(0, file.lastIndexOf("/"));
      if (folder !== "" && app.vault.getFolderByPath(folder) === null) {
        await app.vault.createFolder(folder);
      }
      await app.vault.create(file, content);
    },
    path,
    text,
  );

/** Writes several notes, one after the other, so each lands in the vault before the next. */
export const writeNotes = (notes: readonly (readonly [string, string])[]) =>
  notes.reduce<Promise<void>>(async (previous, [path, text]) => {
    await previous;
    await writeNote(path, text);
  }, Promise.resolve());

/** The names the open view lists, in its order. */
export const listedNames = () =>
  browser.execute(
    (selector) =>
      [
        ...(document.querySelector(selector)?.querySelectorAll("[data-testid=community-name]") ??
          []),
      ].map((element) => element.textContent?.trim() ?? ""),
    ROOT,
  );

/** Waits until the open view lists exactly `names`. */
export const expectListed = (names: readonly string[]) =>
  browser.waitUntil(async () => JSON.stringify(await listedNames()) === JSON.stringify(names), {
    timeoutMsg: `the view never listed ${JSON.stringify(names)}`,
  });

/** The kind and unit label line of each card the open view lists, by community name. */
const summaries = () =>
  browser.execute(
    (selector) =>
      Object.fromEntries(
        [
          ...(document.querySelector(selector)?.querySelectorAll("[data-testid=community]") ?? []),
        ].map((card) => [
          card.querySelector("[data-testid=community-name]")?.textContent?.trim() ?? "",
          card.querySelector("[data-testid=community-summary]")?.textContent?.trim() ?? "",
        ]),
      ),
    ROOT,
  );

/**
 * Waits until the card of `name` shows `summary` (kind and unit label, as the catalog writes them).
 * The card follows a write about 100 ms later, so this is what to wait for before a click or a read
 * that needs the view to know the write: a form opened sooner starts from the old values.
 */
export const expectSummary = (name: string, summary: string) =>
  browser.waitUntil(async () => (await summaries())[name] === summary, {
    timeoutMsg: `the card of ${name} never showed ${summary}`,
  });

/** Types into a field of the open community form. */
export const typeInto = async (key: string, value: string) => {
  const input = browser.$(ROOT).$(`[data-testid=field-${key}]`);
  await input.waitForDisplayed();
  await input.setValue(value);
};

/** Fills the open community form and picks a colour. */
export const fillForm = async (values: {
  readonly name?: string;
  readonly short_code?: string;
  readonly kind?: string;
  readonly unit_label?: string;
  readonly color?: string;
}) => {
  // One after the other, as a person types.
  await (["name", "short_code", "kind", "unit_label"] as const).reduce(async (previous, key) => {
    await previous;
    const value = values[key];
    if (value !== undefined) await typeInto(key, value);
  }, Promise.resolve());
  if (values.color !== undefined) {
    // The radio itself is visually hidden; a person clicks its swatch, the label around it.
    await browser.$(ROOT).$(`input[type=radio][value=${values.color}]`).parentElement().click();
  }
};

export const saveForm = async () => {
  await browser.$(ROOT).$("[data-testid=community-save]").click();
};

export const expectFormClosed = () =>
  expect(browser.$(ROOT).$("[data-testid=community-form]")).not.toExist();

/** Lets deleted notes go to the vault's `.trash` folder, where a spec can look at them. */
export const useVaultTrash = () =>
  browser.executeObsidian(({ app }) => {
    (app.vault as unknown as { setConfig(key: string, value: unknown): void }).setConfig(
      "trashOption",
      "local",
    );
  });

/**
 * Opens a section of the settings screen by the label of its entry in the screen's navigation
 * ("Gemeinschaften", "Datenprobleme"), and waits until it is the current one.
 */
export const openSection = async (label: string) => {
  const entry = browser.$(ROOT).$("[data-testid=settings-sections]").$(`button*=${label}`);
  await entry.click();
  await expect(entry).toHaveAttribute("aria-current", "page");
};
