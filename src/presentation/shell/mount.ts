import ui from "@nuxt/ui/vue-plugin";
import { createApp, h, type Component } from "vue";
import type { AppRuntime } from "../../application/app-services";
import type { RouteLike } from "../../application/shell";
import ShellApp from "./components/ShellApp.vue";
import { keepIconsOffline } from "./icons-offline";
import { provideRouting } from "./navigation";
import { releaseAll } from "./release";
import type { SurfaceDefinition, ViewNavigation } from "./routing";
import { provideRuntime, reportVueError } from "./runtime/use-runtime";
import { PORTAL_CLASS, SCOPE_CLASS } from "./scope";
import { bindHostTheme } from "./theme";

/** Vue's `useId` prefix per app, so two surfaces in one document never share ids. */
const idPrefix = (): string => `wm${crypto.randomUUID().slice(0, 8)}-`;

export type MountOptions<R extends RouteLike> = {
  /** The routes, their screens and the frame's navigation (`appSurface` in the plugin). */
  readonly surface: SurfaceDefinition<R>;
  /** The view's route: the surface shows it and navigates through it. */
  readonly navigation: ViewNavigation<R>;
  /** Replaces the frame (tests mount single components). */
  readonly content?: Component;
  /**
   * The app's element and the portal target for modals and popovers, made by the caller in
   * `root`'s document. Presentation never creates DOM elements itself: in Obsidian the view makes
   * them with Obsidian's `createDiv` (the directory's `prefer-create-el` rule); tests and the
   * harness, which run without Obsidian's DOM helpers, make plain ones.
   */
  readonly elements: SurfaceElements;
};

/** The two elements a surface lives in; `mountSurface` appends them to its root. */
export type SurfaceElements = { readonly host: HTMLElement; readonly portal: HTMLElement };

/**
 * Mounts one Vue app into `root` and returns an idempotent close. Everything lives in
 * `root.ownerDocument` (a pop-out window's document when the view is there): the app element and
 * the portal target for modals and popovers (`options.elements`, appended to `root` and removed on
 * close), and the theme binding.
 */
export const mountSurface = <R extends RouteLike>(
  root: HTMLElement,
  runtime: AppRuntime,
  options: MountOptions<R>,
): (() => void) => {
  const releases: (() => void)[] = [];
  const hadScope = root.classList.contains(SCOPE_CLASS);
  root.classList.add(SCOPE_CLASS);
  releases.push(() => {
    if (!hadScope) root.classList.remove(SCOPE_CLASS);
  });
  releases.push(bindHostTheme(root));

  const { host, portal } = options.elements;
  portal.classList.add(PORTAL_CLASS);
  const app = createApp({
    render: () => h(ShellApp, { portal, ...(options.content ? { content: options.content } : {}) }),
  });
  app.config.idPrefix = idPrefix();
  app.config.errorHandler = (error) => {
    void reportVueError(runtime, error);
  };
  provideRuntime(app, runtime);
  releases.push(provideRouting(app, options.surface, options.navigation));
  keepIconsOffline();
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
