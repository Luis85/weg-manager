import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import type { UserConfig } from "vite";
import { noHeadPlugins } from "../scripts/no-head-plugins.mjs";
import { scopeCss } from "../scripts/scope-css.mjs";
import { writeTailwindEntry } from "./tailwind-entry.ts";

export const PLUGIN_ID = "weg-manager";
export const CSS_PREFIX = "wm";

/**
 * Icons bundled into the plugin (no runtime network). Nuxt UI's default icons (`ui.icons`) are
 * added automatically; list here every other `lucide:*` icon the shell uses.
 */
export const SHELL_ICONS = [
  "lucide:layout-dashboard",
  "lucide:info",
  "lucide:arrow-left",
  "lucide:arrow-right",
  "lucide:building-2",
  "lucide:settings",
  "lucide:plus",
  "lucide:pencil",
  "lucide:trash-2",
  "lucide:check",
  "lucide:lock",
  "lucide:external-link",
  "lucide:circle-check",
  "lucide:triangle-alert",
  "lucide:users",
  "lucide:shield",
  "lucide:archive",
  "lucide:x",
  "lucide:list-checks",
  "lucide:search",
  "lucide:history",
  "lucide:paperclip",
  "lucide:calendar-days",
];

export type SharedOptions = {
  readonly mode: string;
  /** Files whose CSS must stay as written (the harness's fake host CSS). */
  readonly skipScope?: (file: string) => boolean;
};

/** Vue + Nuxt UI + CSS ownership, shared by the plugin build, the harness and the dom tests. */
export const sharedConfig = (options: SharedOptions): UserConfig => {
  writeTailwindEntry();
  return sharedViteConfig(options);
};

const sharedViteConfig = ({ mode, skipScope }: SharedOptions): UserConfig => ({
  plugins: [
    noHeadPlugins(),
    vue(),
    ui({
      router: false,
      colorMode: false,
      autoImport: false,
      components: false,
      theme: { prefix: CSS_PREFIX },
      icon: { mode: "svg", clientBundle: { icons: SHELL_ICONS } },
    }),
  ],
  css: {
    postcss: {
      plugins: [
        scopeCss({ id: PLUGIN_ID, prefix: CSS_PREFIX, ...(skipScope ? { skip: skipScope } : {}) }),
      ],
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode === "development" ? "development" : "production"),
    "import.meta.dev": "false",
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false",
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
  },
});
