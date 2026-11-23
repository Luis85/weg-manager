import { Schema } from "effect";

/** The contacts screen (ADR 0008): the design's `kontakte`, a navigation entry of its own. */
export const CONTACTS = { name: "contacts" } as const;

/** The route schema of the contacts screen. */
export const ContactsRoute = Schema.Struct({ name: Schema.Literal(CONTACTS.name) });
export type ContactsRoute = typeof ContactsRoute.Type;
