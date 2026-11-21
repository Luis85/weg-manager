import { Schema } from "effect";
import {
  checkbox,
  date,
  defineNoteType,
  list,
  number,
  required,
  text,
  type Migrations,
  type RecordValues,
} from "../../../src/domain/notes";

export const TEST_UUID = "3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
export const TEST_ID = `test-item-${TEST_UUID}`;
export const OTHER_ID = "test-item-00000000-0000-4000-8000-000000000002";

const fields = {
  title: required(text()),
  short_code: text({
    schema: Schema.String.check(Schema.isMaxLength(5)),
    issue: "short-code.length",
  }),
  count: number(),
  done: checkbox(),
  due: date(),
  tags: list(),
};

/** v1 called the title `name`; v2 kept the count as text. */
export const TEST_MIGRATIONS: Migrations = {
  1: ({ name, ...rest }) => ({ ...rest, title: name }),
  2: (frontmatter) => {
    const count = frontmatter["count"];
    return { ...frontmatter, count: typeof count === "string" ? Number(count) : count };
  },
};

/** The test-only note type at version 3, with every field kind and a two-step migration. */
export const testItemType = (migrations: Migrations = TEST_MIGRATIONS) =>
  defineNoteType({ type: "test-item", version: 3, fields, migrations });

export const testItem = testItemType();

/** The values a form of the test type saves. */
export type TestValues = RecordValues<typeof testItem.fields>;

/** A valid current note of the test type, every field set. */
export const FULL = {
  schema: "weg-manager.test-item/v3",
  id: TEST_ID,
  title: "Ahornweg 12",
  short_code: "AW",
  count: 4,
  done: false,
  due: "2026-11-21",
  tags: ["a", "b"],
} as const;

export const FULL_VALUES: TestValues = {
  title: "Ahornweg 12",
  short_code: "AW",
  count: 4,
  done: false,
  due: "2026-11-21",
  tags: ["a", "b"],
};
