import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TEST_MANIFEST } from "../../support/obsidian/plugin";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8")) as {
  id: string;
  minAppVersion: string;
  isDesktopOnly: boolean;
};

describe("TEST_MANIFEST", () => {
  it("repeats the real manifest.json's identity, minAppVersion and isDesktopOnly", () => {
    expect({
      id: TEST_MANIFEST.id,
      minAppVersion: TEST_MANIFEST.minAppVersion,
      isDesktopOnly: TEST_MANIFEST.isDesktopOnly,
    }).toEqual({
      id: manifest.id,
      minAppVersion: manifest.minAppVersion,
      isDesktopOnly: manifest.isDesktopOnly,
    });
  });
});
