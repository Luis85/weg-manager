import { describe, expect, it } from "vitest";
import { installHooks } from "../../../scripts/install-hooks.mjs";

const recordingGit = (inside: string | Error = "true\n") => {
  const calls: string[][] = [];
  const git = (args: string[]) => {
    calls.push(args);
    if (args[0] === "rev-parse") {
      if (inside instanceof Error) throw inside;
      return inside;
    }
    return "";
  };
  return { git, calls };
};

describe("installHooks", () => {
  it("sets core.hooksPath inside a work tree", () => {
    const { git, calls } = recordingGit();
    expect(installHooks({}, git)).toBe("installed: core.hooksPath=.githooks");
    expect(calls.at(-1)).toEqual(["config", "core.hooksPath", ".githooks"]);
  });

  it.each(["CI", "TF_BUILD", "GITHUB_ACTIONS"])("does nothing when %s is set", (name) => {
    const { git, calls } = recordingGit();
    expect(installHooks({ [name]: "true" }, git)).toBe("skipped: CI");
    expect(calls).toEqual([]);
  });

  it("does nothing outside a git work tree", () => {
    expect(installHooks({}, recordingGit(new Error("not a repo")).git)).toBe("skipped: no git");
    expect(installHooks({}, recordingGit("false\n").git)).toBe("skipped: no git");
  });
});
