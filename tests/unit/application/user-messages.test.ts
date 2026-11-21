import { describe, expect, it } from "vitest";
import { property, assert as fcAssert, string } from "fast-check";
import {
  ClipboardError,
  InvalidSettingsError,
  ReadOnlySettingsError,
  StorageError,
  VaultReadError,
  type AppError,
} from "../../../src/application/errors";
import {
  describeDefect,
  describeError,
  type UserMessage,
} from "../../../src/application/user-messages";

const FORBIDDEN = ["Error", "stack", "/", "\\"];

const expectPlain = (message: UserMessage, rawCause?: string) => {
  expect(message.title.trim()).not.toBe("");
  expect(message.detail.trim()).not.toBe("");
  for (const text of [message.title, message.detail]) {
    for (const forbidden of FORBIDDEN) expect(text).not.toContain(forbidden);
    if (rawCause !== undefined && rawCause.trim().length > 3) expect(text).not.toContain(rawCause);
  }
};

describe("describeError", () => {
  it("asks to retry when the vault cannot be read", () => {
    const message = describeError(new VaultReadError({ cause: new Error("EACCES /vault") }));
    expectPlain(message, "EACCES /vault");
    expect(message).toMatchObject({ severity: "error", action: "retry" });
  });

  it("asks to retry when saving fails", () => {
    const message = describeError(new StorageError({ cause: new Error("disk full") }));
    expectPlain(message, "disk full");
    expect(message).toMatchObject({ severity: "error", action: "retry" });
  });

  it.each(["newer-version", "unreadable"] as const)(
    "offers diagnostics for read-only settings (%s)",
    (reason) => {
      const message = describeError(new ReadOnlySettingsError({ reason }));
      expectPlain(message);
      expect(message).toMatchObject({ severity: "warning", action: "copy-diagnostics" });
    },
  );

  it("explains the two read-only reasons differently", () => {
    const newer = describeError(new ReadOnlySettingsError({ reason: "newer-version" }));
    const unreadable = describeError(new ReadOnlySettingsError({ reason: "unreadable" }));
    expect(newer.detail).not.toBe(unreadable.detail);
  });

  it("lists every issue of invalid settings and offers no action", () => {
    const message = describeError(
      new InvalidSettingsError({ issues: ["Die Begrüßung fehlt.", "Die Stufe fehlt."] }),
    );
    expectPlain(message);
    expect(message.detail).toContain("Die Begrüßung fehlt.");
    expect(message.detail).toContain("Die Stufe fehlt.");
    expect(message.action).toBeUndefined();
    expect(message.severity).toBe("warning");
  });

  it("asks to retry when the clipboard fails", () => {
    const message = describeError(new ClipboardError({ cause: new Error("denied") }));
    expectPlain(message, "denied");
    expect(message.action).toBe("retry");
  });

  it("never leaks the cause text of any error", () => {
    expect.hasAssertions();
    fcAssert(
      property(string(), (text) => {
        const errors: AppError[] = [
          new StorageError({ cause: new Error(text) }),
          new VaultReadError({ cause: new Error(text) }),
          new ClipboardError({ cause: text }),
        ];
        for (const error of errors) expectPlain(describeError(error), text);
      }),
    );
  });
});

describe("describeDefect", () => {
  it("names the plugin and the incident id and offers diagnostics", () => {
    const message = describeDefect("K7Q2");
    expectPlain(message);
    expect(message.title).toContain("WEG Manager");
    expect(message.detail).toContain("K7Q2");
    expect(message).toMatchObject({ severity: "error", action: "copy-diagnostics" });
  });
});
