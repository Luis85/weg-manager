/**
 * The German catalog the specs read user-visible texts from, so a wording change touches the
 * catalog and not twenty checks. It is plain data (`src/application/messages.ts` imports only the
 * application layer, which has no `obsidian`, DOM or Vue import), so the specs, which run in Node,
 * can load it. Literal sentences stay in `language.e2e.ts`, whose point is the wording itself.
 */
export { de } from "../../src/application/messages";
