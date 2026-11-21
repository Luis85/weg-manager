import { Effect, Layer } from "effect";
import { DeviceStore, type DeviceValue } from "./ports";

const copy = (value: DeviceValue): DeviceValue => structuredClone(value);

/** A device store in memory, for tests and the harness; `initial` seeds it. */
export const deviceStoreInMemory = (initial: Readonly<Record<string, DeviceValue>> = {}) =>
  Layer.sync(DeviceStore, () => {
    const values = new Map(Object.entries(initial).map(([key, value]) => [key, copy(value)]));
    return DeviceStore.of({
      read: (key) =>
        Effect.sync(() => {
          const value = values.get(key);
          return value === undefined ? undefined : copy(value);
        }),
      write: (key, value) =>
        Effect.sync(() => {
          if (value === undefined) values.delete(key);
          else values.set(key, copy(value));
        }),
    });
  });
