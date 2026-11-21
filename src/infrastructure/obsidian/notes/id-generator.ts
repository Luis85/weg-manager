import { Effect, Layer } from "effect";
import { IdGenerator } from "../../../application/notes";

/**
 * The plugin's `IdGenerator`: `crypto.randomUUID()`, the Web Crypto API that Obsidian's Electron
 * and mobile web views provide. It needs no Obsidian API; it lives with the notes adapters because
 * `notesLayer` provides it.
 */
export const randomIdGeneratorLayer: Layer.Layer<IdGenerator> = Layer.succeed(IdGenerator)({
  uuid: Effect.sync(() => crypto.randomUUID()),
});
