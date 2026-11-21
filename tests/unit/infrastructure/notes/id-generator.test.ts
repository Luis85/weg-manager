import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { IdGenerator } from "../../../../src/application/notes";
import { parseRecordId, recordId } from "../../../../src/domain/notes";
import { sequentialIdGenerator } from "../../../../src/infrastructure/memory/notes";
import { randomIdGeneratorLayer } from "../../../../src/infrastructure/obsidian/notes/id-generator";

const draw = (count: number) =>
  Effect.all(Array.from({ length: count }, () => IdGenerator.use((ids) => ids.uuid)));

describe("randomIdGeneratorLayer", () => {
  it("makes a fresh lower-case UUID each time, valid in a record id", async () => {
    const uuids = await Effect.runPromise(draw(20).pipe(Effect.provide(randomIdGeneratorLayer)));
    expect(new Set(uuids).size).toBe(20);
    for (const uuid of uuids) {
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(parseRecordId(recordId("community", uuid))).toEqual({ type: "community", uuid });
    }
  });
});

describe("sequentialIdGenerator", () => {
  it("counts up from 1, the same in every run, and each instance on its own", async () => {
    const ids = sequentialIdGenerator();
    const first = await Effect.runPromise(draw(2).pipe(Effect.provide(ids.layer)));
    const next = await Effect.runPromise(draw(1).pipe(Effect.provide(ids.layer)));
    const fresh = await Effect.runPromise(
      draw(1).pipe(Effect.provide(sequentialIdGenerator().layer)),
    );
    expect([...first, ...next, ...fresh]).toEqual([
      "00000000-0000-4000-8000-000000000001",
      "00000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000001",
    ]);
    expect(ids.issued()).toBe(3);
  });

  it("writes the count in hexadecimal", async () => {
    const ids = sequentialIdGenerator();
    const uuids = await Effect.runPromise(draw(16).pipe(Effect.provide(ids.layer)));
    expect(uuids.at(-1)).toBe("00000000-0000-4000-8000-000000000010");
  });
});
