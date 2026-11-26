import { CONTACTS } from "../../application/contacts";
import type { ModuleScreens } from "../shell";

/**
 * The contacts module's screens (ADR 0006): its own screen `contacts` with an entry in the frame's
 * navigation (owner decision 23.11.2026: not in the settings). Vue-free: the components load with
 * the module's `index.ts` when they are first shown.
 */
export const contactsScreens = {
  screens: {
    contacts: () => import("./index").then(({ contactsScreen }) => contactsScreen),
  },
  sections: {},
  menu: [{ route: CONTACTS, label: (catalog) => catalog.contacts.route, icon: "i-lucide-users" }],
} satisfies ModuleScreens<"contacts">;
