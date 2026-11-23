// The public face of the contacts module's presentation (ADR 0006). It loads Vue, so
// `src/presentation/app-surface.ts` imports it only lazily.
import type { Component } from "vue";
import ContactsScreen from "./components/ContactsScreen.vue";

/** The module's screen: the contacts, their form and the inactive filter. */
export const contactsScreen: Component = ContactsScreen;
