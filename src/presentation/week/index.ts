// The public face of the week module's presentation (ADR 0006). It loads Vue, so
// `src/presentation/app-surface.ts` imports it only lazily.
import type { Component } from "vue";
import WeekScreen from "./components/WeekScreen.vue";

/** The module's screen: the briefing, the deadlines of the next 14 days and the own to-dos. */
export const weekScreen: Component = WeekScreen;
