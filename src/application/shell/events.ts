import type { AppEvent } from "../events";

/**
 * The shell's members of `AppEvent` (`src/application/events.ts`), as plain serialisable data: no
 * Obsidian types, no class instances, no functions. Consumers switch exhaustively on `_tag`.
 *
 * **Host events** are mapped from Obsidian at the edge
 * (`src/infrastructure/obsidian/shell/events.ts`). File events concern files only; folders are not
 * published. Every path is vault-relative.
 *
 * **Adding an event** (host or domain, e.g. a future `CommunityCreated { communityId }`): add one
 * member to its module's record (this one for the shell) with plain readonly fields, then publish
 * it with `AppEvent.<Tag>({...})` through `EventBus.publish`. Domain events go into the same union;
 * there is no second bus. A consumer that switches exhaustively on `_tag` stops compiling until it
 * handles the new member. See ADR 0004.
 */
export type ShellEvents = {
  /** A file was created, after the workspace layout became ready. */
  FileCreated: { readonly path: string; readonly extension: string };
  FileModified: { readonly path: string; readonly extension: string };
  FileDeleted: { readonly path: string; readonly extension: string };
  FileRenamed: { readonly path: string; readonly oldPath: string; readonly extension: string };
  /** Obsidian re-indexed the file's metadata (`metadataCache` "changed"). */
  MetadataChanged: { readonly path: string; readonly extension: string };
  /** The workspace layout is ready. Published once per plugin load, before any other host event. */
  LayoutReady: Record<never, never>;
  /**
   * The metadata cache holds the frontmatter of every Markdown file the vault has at this moment,
   * so records read now are complete. Published once per plugin load, after `LayoutReady`: with it
   * after a warm restart or when the plugin is enabled in a running app, later on a cold start,
   * once Obsidian has indexed every file. Events published before it are already part of what a
   * read now returns; see docs/engineering/architecture.md (Events) for how a consumer uses it.
   */
  VaultReady: Record<never, never>;
  /** The file shown in the active editor changed; `null` when no file is open there. */
  ActiveFileChanged: { readonly path: string | null };
  ColorSchemeChanged: { readonly scheme: "light" | "dark" };
};

/** True for an event about a Markdown file, with Obsidian's own test (`extension === "md"`). */
export const isMarkdown = (event: AppEvent): boolean =>
  "extension" in event && event.extension === "md";

/**
 * True when the set of Markdown files changed: one was created or deleted, or a rename moved a
 * file into or out of Markdown. Edits and metadata changes keep the set as it is.
 */
export const changesMarkdownFiles = (event: AppEvent): boolean => {
  switch (event._tag) {
    case "FileCreated":
    case "FileDeleted":
      return event.extension === "md";
    case "FileRenamed":
      return (event.extension === "md") !== event.oldPath.endsWith(".md");
    default:
      return false;
  }
};
