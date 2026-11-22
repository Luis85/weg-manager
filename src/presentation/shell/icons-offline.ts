import { _api } from "@iconify/vue";

/**
 * What the Iconify client's `fetch` answers: 404, which it treats as "this host does not have the
 * icon" and abandons the query for. No request leaves the app.
 */
const noIconsOnline: typeof fetch = () => Promise.resolve(new Response(null, { status: 404 }));

/**
 * The plugin makes no network request at runtime. Nuxt UI draws icons through `@iconify/vue`,
 * which asks `api.iconify.design` for any icon the bundle does not hold; the bundled ones
 * (`SHELL_ICONS` in `configs/vite.shared.ts`) never reach it. Replacing the client's `fetch`
 * turns a missing icon into an empty space instead of a request. The API resources cannot be
 * emptied instead: `addAPIProvider` rejects an empty list and keeps the defaults.
 */
export const keepIconsOffline = (): void => {
  _api.setFetch(noIconsOnline);
};
