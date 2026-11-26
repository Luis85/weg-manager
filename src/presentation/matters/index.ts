// The public face of the matters module's presentation (ADR 0006). It loads Vue, so
// `src/presentation/app-surface.ts` imports it only lazily.
import type { Component } from "vue";
import MattersScreen from "./components/MattersScreen.vue";

/** The module's screen: the matters, their search and filters, and their form. */
export const mattersScreen: Component = MattersScreen;
