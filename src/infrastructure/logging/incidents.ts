import { Effect, Layer, Random } from "effect";
import { Incidents } from "../../application/shell/ports";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LENGTH = 6;

/** Short ids a user can read out or paste into a support request, e.g. `K7Q2ZD`. */
const nextId = Effect.gen(function* () {
  let id = "";
  for (let index = 0; index < LENGTH; index += 1) {
    id += ALPHABET[yield* Random.nextIntBetween(0, ALPHABET.length - 1)];
  }
  return id;
});

export const incidentsLayer = Layer.succeed(Incidents)({ nextId });
