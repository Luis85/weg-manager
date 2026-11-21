import { browser, expect } from "@wdio/globals";
import { describe, it } from "mocha";
import { ROOT, installConsoleSpy, openView, pluginProblems } from "../support";

/**
 * The plugin makes no network request at runtime (README, ADR 0001). Nuxt UI's icons come from
 * the bundle (`SHELL_ICONS`); an icon missing there would be asked of Iconify's API, which
 * `keepIconsOffline` prevents. This is the check in real Obsidian: after the view and the
 * community form are open, no resource entry of the page points to a web host.
 */
describe("no network at runtime", function () {
  it("requests no web resource while the view and the community form are open", async function () {
    await installConsoleSpy();
    await openView();
    const root = browser.$(ROOT);
    await expect(root.$("[data-testid=communities-empty]")).toBeDisplayed();
    await root.$("[data-testid=community-add]").click();
    await expect(root.$("[data-testid=community-form]")).toBeDisplayed();
    // Iconify asks for a missing icon a moment after it is drawn; let a request show up.
    await browser.pause(1000);

    const external = await browser.executeObsidian(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => /^(https?|wss?):/i.test(name)),
    );
    expect(external).toEqual([]);
    expect(await pluginProblems()).toEqual([]);
  });
});
