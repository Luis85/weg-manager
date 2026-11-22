import { stringifyYaml, type App } from "obsidian";
import type { NoteStoreFixture } from "../../support/notes/fixture";
import { eventRecorder } from "../../support/notes/recorder";
import { noteStoreLayer } from "../../../src/infrastructure/obsidian/notes";
import { SKIP_REASONS } from "./contract-skips";

/** A case that needs a hook real Obsidian cannot give: it is listed as skipped, with the reason. */
export class SkipCase extends Error {
  override readonly name = "SkipCase";
}

type NodeFs = {
  mkdirSync(path: string, options: { readonly recursive: true }): void;
  writeFileSync(path: string, text: string): void;
  unlinkSync(path: string): void;
};

const textOf = (frontmatter: Parameters<NoteStoreFixture["seed"]>[1], body = ""): string => {
  if (frontmatter === "none") return body;
  if (frontmatter === "broken") return `---\nschema: [unclosed\n---\n${body}`;
  return `---\n${stringifyYaml(frontmatter)}---\n${body}`;
};

/** The block as `fileManager.processFrontMatter` finds it, and the body after it. */
const FRONTMATTER = /^---\r?\n(?:[^]*?\n)?---(?:\r?\n|$)/;

const parentOf = (path: string) =>
  path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "/";

/** Waits until `holds()`, checking every few milliseconds, for at most 10 s. */
const until = async (holds: () => boolean, what: string): Promise<void> => {
  const deadline = Date.now() + 10_000;
  while (!holds()) {
    if (Date.now() > deadline) throw new Error(`timed out waiting until ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

/**
 * The NoteStore contract's fixture on a real Obsidian vault and the real adapter. A note seeded
 * "from outside" is written through the vault (a person or Sync, as Obsidian then sees it); a
 * path that only Node can write (a name in NFD) and an outside delete go through Node's `fs`, and
 * the fixture waits until the vault lists the change. `settle` is the event recorder's fence. The
 * knobs real Obsidian has no counterpart for throw `SkipCase`.
 */
export const obsidianFixture = (app: App): NoteStoreFixture & { dispose(): void } => {
  const { vault } = app;
  const recorder = eventRecorder(app, {});
  const fs = (window as unknown as { require(name: "fs"): NodeFs }).require("fs");
  const onDisk = (path: string) =>
    `${(vault.adapter as unknown as { basePath: string }).basePath}/${path}`;
  const skip = (reason: string) => () => {
    throw new SkipCase(reason);
  };
  return {
    layer: noteStoreLayer(app),
    seed: async (path, frontmatter, body) => {
      const text = textOf(frontmatter, body);
      if (path !== path.normalize("NFC")) {
        fs.mkdirSync(onDisk(parentOf(path)), { recursive: true });
        fs.writeFileSync(onDisk(path), text);
        // Obsidian lists a name written in NFD in its NFC form.
        const listed = path.normalize("NFC");
        await until(() => vault.getFileByPath(listed) !== null, `the vault lists ${listed}`);
        return;
      }
      const existing = vault.getFileByPath(path);
      if (existing !== null) {
        await vault.modify(existing, text);
        return;
      }
      const parent = parentOf(path);
      if (parent !== "/" && vault.getAbstractFileByPath(parent) === null) {
        await vault.createFolder(parent);
      }
      await vault.create(path, text);
    },
    removeOutside: (path) => {
      fs.unlinkSync(onDisk(path));
    },
    removeOutsideUnnoticed: skip(SKIP_REASONS.unnoticed),
    settle: async () => {
      await recorder.fence();
    },
    body: async (path) => {
      const file = vault.getFileByPath(path);
      if (file === null) return undefined;
      const text = await vault.read(file);
      return text.replace(FRONTMATTER, "");
    },
    isFolder: (path) => vault.getFolderByPath(path) !== null,
    setFailReads: skip(SKIP_REASONS.failReads),
    setFailWrites: skip(SKIP_REASONS.failWrites),
    holdWrites: skip(SKIP_REASONS.holdWrites),
    releaseWrites: skip(SKIP_REASONS.holdWrites),
    heldWrites: skip(SKIP_REASONS.holdWrites),
    dispose: () => recorder.dispose(),
  };
};

/** Waits until the vault no longer lists `paths`, as after Obsidian's watcher reported them. */
export const untilGone = (app: App, paths: readonly string[]) =>
  until(
    () => paths.every((path) => app.vault.getAbstractFileByPath(path) === null),
    `the vault no longer lists ${paths.join(", ")}`,
  );
