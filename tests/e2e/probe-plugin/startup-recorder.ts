import type { App, EventRef, Events } from "obsidian";

/** How far the metadata cache was at one moment, counted over the vault's Markdown files. */
export type CacheSnapshot = {
  readonly at: string;
  /** Milliseconds since the recorder started (the probe's `onload`). */
  readonly ms: number;
  readonly layoutReady: boolean;
  readonly markdown: number;
  /** Files for which `getFileCache` returns an entry. */
  readonly cached: number;
  /** Files whose entry holds `frontmatter`. */
  readonly frontmatter: number;
};

export type StartupRecord = {
  readonly snapshots: readonly CacheSnapshot[];
  /** How often each event fired: `vault:create`, `metadataCache:resolved`, `bus:VaultReady`, … */
  readonly counts: Readonly<Record<string, number>>;
  /** First and last time each event fired, in ms since the start. */
  readonly first: Readonly<Record<string, number>>;
  readonly last: Readonly<Record<string, number>>;
};

const OBSIDIAN_EVENTS = [
  ["vault", "create"],
  ["metadataCache", "changed"],
  ["metadataCache", "resolve"],
  ["metadataCache", "resolved"],
] as const;

/**
 * Records how Obsidian gets ready from the moment it is started (the probe's `onload`): when the
 * layout is ready, the first `resolved`, the counts and first and last times of `create`,
 * `changed`, `resolve` and `resolved`, and the `AppEvent`s that the probe's own host event adapter
 * publishes (`event(tag)`). At the layout, the first `resolved` and every `LayoutReady` or
 * `VaultReady` it counts how many Markdown files the metadata cache holds and how many of those
 * have frontmatter. A snapshot scans the vault, so it is never taken per file. Read by
 * `tests/e2e/specs/vault-ready.e2e.ts`.
 */
export const startupRecorder = (app: App) => {
  const started = performance.now();
  const ms = () => Math.round((performance.now() - started) * 10) / 10;
  const counts: Record<string, number> = {};
  const first: Record<string, number> = {};
  const last: Record<string, number> = {};
  const snapshots: CacheSnapshot[] = [];
  let live = true;

  const snapshot = (at: string) => {
    const files = app.vault.getMarkdownFiles();
    let cached = 0;
    let frontmatter = 0;
    for (const file of files) {
      const cache = app.metadataCache.getFileCache(file);
      if (cache !== null) cached += 1;
      if (cache?.frontmatter !== undefined) frontmatter += 1;
    }
    const layoutReady = app.workspace.layoutReady;
    snapshots.push({ at, ms: ms(), layoutReady, markdown: files.length, cached, frontmatter });
  };
  /** Counts an event and returns how often it has fired now. */
  const count = (name: string): number => {
    const now = ms();
    counts[name] = (counts[name] ?? 0) + 1;
    first[name] ??= now;
    last[name] = now;
    return counts[name];
  };

  snapshot("onload");
  const refs = OBSIDIAN_EVENTS.map(([source, name]): [Events, EventRef] => {
    const emitter: Events = source === "vault" ? app.vault : app.metadataCache;
    const label = `${source}:${name}`;
    return [
      emitter,
      emitter.on(name, () => {
        if (count(label) === 1 && name === "resolved") snapshot(label);
      }),
    ];
  });
  app.workspace.onLayoutReady(() => {
    if (live) snapshot("layout-ready");
  });

  return {
    record: (): StartupRecord => ({
      snapshots: [...snapshots],
      counts: { ...counts },
      first: { ...first },
      last: { ...last },
    }),
    /** An `AppEvent` the probe's host event adapter publishes, called inside the publish. */
    event: (tag: string) => {
      count(`bus:${tag}`);
      if (tag === "LayoutReady" || tag === "VaultReady") snapshot(`bus:${tag}`);
    },
    dispose: () => {
      live = false;
      for (const [emitter, ref] of refs) emitter.offref(ref);
    },
  };
};

export type StartupRecorder = ReturnType<typeof startupRecorder>;
