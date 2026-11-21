import { describe, expect, it } from "vitest";
import { parseRecordId, recordId, recordIdIssue } from "../../../../src/domain/notes/record-id";

const UUID = "3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";

describe("recordId", () => {
  it("joins the type and the uuid", () => {
    expect(recordId("community", UUID)).toBe(`community-${UUID}`);
  });
});

describe("parseRecordId", () => {
  it.each([
    [`community-${UUID}`, "community", UUID],
    [`test-item-${UUID}`, "test-item", UUID],
    ["a-b-abcdefab-abcd-abcd-abcd-abcdefabcdef", "a-b", "abcdefab-abcd-abcd-abcd-abcdefabcdef"],
    ["x-00000000-0000-0000-0000-000000000000", "x", "00000000-0000-0000-0000-000000000000"],
    ["x-99999999-9999-9999-9999-999999999999", "x", "99999999-9999-9999-9999-999999999999"],
  ])("reads %j", (value, type, uuid) => {
    expect(parseRecordId(value)).toEqual({ type, uuid });
  });

  it.each([
    undefined,
    null,
    1,
    [`community-${UUID}`],
    "",
    UUID,
    `-${UUID}`,
    `community${UUID}`,
    `community-${UUID.toUpperCase()}`,
    `Community-${UUID}`,
    `community_x-${UUID}`,
    `community2-${UUID}`,
    `community--${UUID}`,
    `community-${UUID} `,
    ` community-${UUID}`,
    `community-${UUID}0`,
    `community-${UUID.slice(1)}`,
    "community-3f2b8c1e7a444d0b9c2e5b1f0a6d9e21",
    "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e2g",
    "community-3f2b8c1-e7a44-4d0b-9c2e-5b1f0a6d9e21",
    "community-3f2b8c1e-7a4-44d0b-9c2e-5b1f0a6d9e21",
    "community-3f2b8c1e-7a44-4d0-b9c2e-5b1f0a6d9e21",
    "community-3f2b8c1e-7a44-4d0b-9c2-e5b1f0a6d9e21",
    "community-3f2b8c1e-7a44-4d0b-9c2e5-b1f0a6d9e21",
    "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e2",
    `community-${UUID}-${UUID}`,
  ])("refuses %j", (value) => {
    expect(parseRecordId(value)).toBeUndefined();
  });
});

describe("recordIdIssue", () => {
  it("accepts an id of the note's type", () => {
    expect(recordIdIssue("community", `community-${UUID}`)).toBeUndefined();
    expect(recordIdIssue("test-item", `test-item-${UUID}`)).toBeUndefined();
  });

  it.each([undefined, null])("calls %j missing", (value) => {
    expect(recordIdIssue("community", value)).toEqual({ code: "id.missing" });
  });

  it.each(["", "community-1", UUID, 42, [`community-${UUID}`]])("calls %j malformed", (value) => {
    expect(recordIdIssue("community", value)).toEqual({ code: "id.malformed" });
  });

  it("names an id of another type", () => {
    expect(recordIdIssue("community", `item-${UUID}`)).toEqual({ code: "id.other-type" });
    expect(recordIdIssue("test", `test-item-${UUID}`)).toEqual({ code: "id.other-type" });
    expect(recordIdIssue("test-item", `item-${UUID}`)).toEqual({ code: "id.other-type" });
  });
});
