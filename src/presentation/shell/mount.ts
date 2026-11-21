import ui from "@nuxt/ui/vue-plugin";
import { createApp, h, type Component } from "vue";
import type { AppRuntime } from "../../application/app-services";
import ShellApp from "./components/ShellApp.vue";
import { provideRuntime, reportVueError } from "./runtime/use-runtime";
import { releaseAll } from "./release";
import { PORTAL_CLASS, SCOPE_CLASS } from "./scope";
import { bindHostTheme } from "./theme";

/** Vue's `useId` prefix per app, so two surfaces in one document never share ids. */
const idPrefix = (): string => `wm${crypto.randomUUID().slice(0, 8)}-`;

/**
 * Mounts one Vue app into `root` and returns an idempotent close. Everything lives in
 * `root.ownerDocument` (a pop-out window's document when the view is there): the app element,
 * the portal target for modals and popovers, and the theme binding.
 */
export type MountOptions = {
  /** Replaces the panel (tests and the harness mount other content). */
  readonly content?: Component;
};

export const mountSurface = (
  root: HTMLElement,
  runtime: AppRuntime,
  options: MountOptions = {},
): (() => void) => {
  const doc = root.ownerDocument;
  const releases: (() => void)[] = [];
  const hadScope = root.classList.contains(SCOPE_CLASS);
  root.classList.add(SCOPE_CLASS);
  releases.push(() => {
    if (!hadScope) root.classList.remove(SCOPE_CLASS);
  });
  releases.push(bindHostTheme(root));

  const host = doc.createElement("div");
  const portal = doc.createElement("div");
  portal.className = PORTAL_CLASS;
  const app = createApp({
    render: () => h(ShellApp, { portal, ...(options.content ? { content: options.content } : {}) }),
  });
  app.config.idPrefix = idPrefix();
  app.config.errorHandler = (error) => {
    void reportVueError(runtime, error);
  };
  provideRuntime(app, runtime);
  app.use(ui);
  // Attach first, so floating UI and focus handling measure a connected element on mount.
  root.append(host, portal);
  releases.push(() => {
    host.remove();
    portal.remove();
  });
  app.mount(host);
  releases.push(() => app.unmount());

  let closed = false;
  return () => {
    if (closed) return;
    closed = true;
    releaseAll(releases);
  };
};
