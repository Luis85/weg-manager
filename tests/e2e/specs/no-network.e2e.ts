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
    // The one wait in the suite that lets real time pass, and it stays on purpose. This is a
    // negative check ("no request left"), and when the plugin works nothing happens, so there is
    // no signal to wait for instead: `@iconify/vue` asks for a missing icon through two chained
    // zero-delay timers after the icon is drawn, and a request that left would show as a resource
    // entry only when its response (or its failure) came, a network round trip later. The chain
    // itself is a few milliseconds; the rest of the second is the allowance for that round trip.
    // It is time spent only on a passing run: a leak would show up inside it and fail below.
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
