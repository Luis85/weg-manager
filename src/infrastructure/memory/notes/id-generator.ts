import { Effect, Layer } from "effect";
import { IdGenerator } from "../../../application/notes";

/**
 * The `IdGenerator` for tests and the browser harness: UUIDs that count up from
 * `00000000-0000-4000-8000-000000000001`, so every run creates the same ids. Each call makes a
 * counter of its own; `issued` says how many it gave out.
 */
export const sequentialIdGenerator = () => {
  let issued = 0;
  const layer = Layer.succeed(IdGenerator)({
    uuid: Effect.sync(() => {
      issued += 1;
      return `00000000-0000-4000-8000-${issued.toString(16).padStart(12, "0")}`;
    }),
  });
  return { layer, issued: (): number => issued };
};
