import { afterEach, describe, expect, it } from "vitest";
import { SELECTION_KEY } from "../../../../src/application/communities";
import { de } from "../../../../src/application/messages";
import { DeviceStore } from "../../../../src/application/shell";
import { appSurface } from "../../../../src/presentation/app-surface";
import { memoryNavigation } from "../../../../src/presentation/shell/host";
import {
  FOLDER,
  closeAll,
  communityId,
  communityNote,
  openCommunities,
  settle,
  type Memory,
  type OpenScreen,
} from "../../../support/communities/screen";
import { mountApp } from "../../../support/surface";

afterEach(closeAll);

const t = de.communities;

const TWO = (notes: Memory) => {
  notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "Ahornweg 12", short_code: "AW" }));
  notes.seed(
    `${FOLDER}/T.md`,
    communityNote(2, { name: "Tiefgarage", short_code: "TG", color: "violet" }),
  );
};

const THREE = (notes: Memory) => {
  TWO(notes);
  notes.seed(
    `${FOLDER}/B.md`,
    communityNote(3, { name: "Birke", short_code: "BI", color: "blue" }),
  );
};

const options = (root: ParentNode) => [
  ...root.querySelectorAll<HTMLButtonElement>("[data-testid=community-option]"),
];
/** Each option's visible text and whether it is checked. */
const checked = (root: ParentNode) =>
  options(root).map((button) => [
    [...button.querySelectorAll("*")]
      .filter((element) => element.children.length === 0)
      .map((element) => element.textContent.trim())
      .filter((text) => text !== "")
      .join(" "),
    button.getAttribute("aria-checked"),
  ]);
const storedSelection = (screen: OpenScreen) =>
  screen.runtime.runPromise(DeviceStore.use((store) => store.read(SELECTION_KEY)));
const key = (target: Element | undefined, name: string) => {
  target?.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true }));
  return settle();
};

describe("the community switch", () => {
  it("says there is no community yet", async () => {
    const screen = await openCommunities();
    expect(screen.q("community-switch")?.textContent).toContain(t.switcher.none);
    expect(options(screen.root)).toEqual([]);
  });

  it("is one choice: a radio group named by its caption, with radio options", async () => {
    const screen = await openCommunities({ seed: TWO });
    const group = screen.q("community-options");
    const caption = document.getElementById(group?.getAttribute("aria-labelledby") ?? "");
    expect([group?.getAttribute("role"), caption?.textContent.trim()]).toEqual([
      "radiogroup",
      t.switcher.label,
    ]);
    expect(options(screen.root).map((option) => option.getAttribute("role"))).toEqual([
      "radio",
      "radio",
    ]);
  });

  it("selects the only community, with its short code, colour and name", async () => {
    const screen = await openCommunities({
      seed: (notes) =>
        notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "Ahornweg 12", short_code: "AW" })),
    });
    await screen.until(() => expect(checked(screen.root)).toEqual([["AW Ahornweg 12", "true"]]));
    const badge = options(screen.root)[0]?.querySelector<HTMLElement>(
      "[data-testid=community-badge]",
    );
    expect(badge?.dataset["communityColor"]).toBe("teal");
    expect(screen.text("community-choice")).toBe("");
    expect(await storedSelection(screen)).toBe(communityId(1));
  });

  it("asks for a choice among two with a warning mark, and every view follows the choice", async () => {
    const screen = await openCommunities({ seed: TWO });
    expect(checked(screen.root)).toEqual([
      ["AW Ahornweg 12", "false"],
      ["TG Tiefgarage", "false"],
    ]);
    const choice = screen.q("community-choice");
    expect([choice?.getAttribute("role"), choice?.textContent.trim()]).toEqual([
      "status",
      t.switcher.choose,
    ]);
    expect(choice?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    const second = document.createElement("div");
    document.body.append(second);
    const close = mountApp(second, screen.runtime, { navigation: memoryNavigation(appSurface) });
    await settle();
    await screen.click(options(screen.root)[1]);
    expect(checked(screen.root)).toEqual([
      ["AW Ahornweg 12", "false"],
      ["TG Tiefgarage", "true"],
    ]);
    await screen.until(() =>
      expect(checked(second)).toEqual([
        ["AW Ahornweg 12", "false"],
        ["TG Tiefgarage", "true"],
      ]),
    );
    expect(screen.text("community-choice")).toBe("");
    expect(await storedSelection(screen)).toBe(communityId(2));
    close();
  });

  it("keeps the choice stored for the device", async () => {
    const screen = await openCommunities({
      seed: TWO,
      device: { [SELECTION_KEY]: communityId(2) },
    });
    expect(checked(screen.root)).toEqual([
      ["AW Ahornweg 12", "false"],
      ["TG Tiefgarage", "true"],
    ]);
  });

  it("puts only the checked option, else the first, in the tab order", async () => {
    const screen = await openCommunities({ seed: THREE });
    expect(options(screen.root).map((option) => option.tabIndex)).toEqual([0, -1, -1]);
    await screen.click(options(screen.root)[2]);
    expect(options(screen.root).map((option) => option.tabIndex)).toEqual([-1, -1, 0]);
  });

  it("moves the choice with the arrow keys, Home and End, and the focus with it", async () => {
    const screen = await openCommunities({
      seed: THREE,
      device: { [SELECTION_KEY]: communityId(1) },
    });
    const at = () =>
      options(screen.root).findIndex((option) => option.getAttribute("aria-checked") === "true");
    const focused = () => options(screen.root).indexOf(document.activeElement as HTMLButtonElement);
    options(screen.root)[0]?.focus();
    await key(options(screen.root)[0], "ArrowDown");
    await screen.until(() => expect([at(), focused()]).toEqual([1, 1]));
    await key(options(screen.root)[1], "ArrowRight");
    await screen.until(() => expect([at(), focused()]).toEqual([2, 2]));
    await key(options(screen.root)[2], "ArrowDown");
    await screen.until(() => expect([at(), focused()]).toEqual([0, 0]));
    await key(options(screen.root)[0], "ArrowUp");
    await screen.until(() => expect([at(), focused()]).toEqual([2, 2]));
    await key(options(screen.root)[2], "Home");
    await screen.until(() => expect([at(), focused()]).toEqual([0, 0]));
    await key(options(screen.root)[0], "End");
    await screen.until(() => expect([at(), focused()]).toEqual([2, 2]));
    await key(options(screen.root)[2], "ArrowLeft");
    await screen.until(() => expect([at(), focused()]).toEqual([1, 1]));
    await key(options(screen.root)[1], "a");
    expect([at(), focused()]).toEqual([1, 1]);
    // The list is sorted by name: Ahornweg 12, Birke, Tiefgarage.
    expect(await storedSelection(screen)).toBe(communityId(3));
  });

  it("offers no community with an issue, and says when none can be chosen", async () => {
    const screen = await openCommunities({
      seed: (notes) => {
        notes.seed(`${FOLDER}/A.md`, communityNote(1, { name: "A", color: "amber" }));
        notes.seed(
          `${FOLDER}/B.md`,
          communityNote(2, { name: "B", schema: "weg-manager.community/v2" }),
        );
      },
    });
    expect(options(screen.root)).toEqual([]);
    expect(screen.q("community-switch")?.textContent).toContain(t.switcher.unavailable);
    screen.notes.seed(`${FOLDER}/C.md`, communityNote(3, { name: "C", color: "blue" }));
    await screen.until(() => expect(checked(screen.root)).toEqual([["G3 C", "true"]]));
  });

  it("shows nothing while the list is read, then a status once that takes over 300 ms", async () => {
    const screen = await openCommunities({ ready: false });
    expect(screen.q("community-switch")?.textContent.trim()).toBe(t.switcher.label);
    expect(screen.q("community-options")).toBeUndefined();
    await screen.until(() =>
      expect(screen.text("community-switch-loading")).toBe(t.switcher.loading),
    );
    expect(screen.q("community-switch-loading")?.getAttribute("role")).toBe("status");
    await screen.vaultReady();
    await screen.until(() => expect(screen.q("community-switch-loading")).toBeUndefined());
    expect(screen.q("community-switch")?.textContent).toContain(t.switcher.none);
  });

  it("hides itself after a failed first read; the screen says why", async () => {
    const screen = await openCommunities({ seed: (notes) => notes.setFailReads(true) });
    expect(screen.q("community-switch")).toBeUndefined();
    expect(screen.q("communities-failure")).toBeDefined();
  });

  it("marks the selected option with a check mark, not by colour alone", async () => {
    const screen = await openCommunities({ seed: TWO });
    const checks = () =>
      options(screen.root).map(
        (button) => button.querySelector("[data-testid=community-option-check]") !== null,
      );
    expect(checks()).toEqual([false, false]);
    await screen.click(options(screen.root)[1]);
    expect(checks()).toEqual([false, true]);
    const check = options(screen.root)[1]?.querySelector("[data-testid=community-option-check]");
    expect(check?.getAttribute("aria-hidden")).toBe("true");
  });

  it("gives each option its full name as title, so a name cut off in the column stays readable", async () => {
    const long = "Wohnungseigentümergemeinschaft Ahornweg 12–16 und Birkenallee 3, Vorderhaus";
    const screen = await openCommunities({
      seed: (notes) => {
        TWO(notes);
        notes.seed(
          `${FOLDER}/L.md`,
          communityNote(3, { name: long, short_code: "WEG", color: "blue" }),
        );
      },
    });
    expect(options(screen.root).map((button) => button.title)).toEqual([
      "Ahornweg 12",
      "Tiefgarage",
      long,
    ]);
    const name = options(screen.root)[2]?.querySelector("[data-testid=community-option-name]");
    expect(name?.classList.contains("wm:truncate")).toBe(true);
    expect(name?.classList.contains("wm:min-w-0")).toBe(true);
  });
});
