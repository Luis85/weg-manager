import { Data } from "effect";
import type { ShellEvents } from "./shell";

/**
 * Everything that happens to the plugin: one tagged union built from the modules' event records
 * (ADR 0004, ADR 0006). A module adds its record here with `&`. Consumers switch exhaustively on
 * `_tag`.
 */
export type AppEvent = Data.TaggedEnum<ShellEvents>;

export const AppEvent = Data.taggedEnum<AppEvent>();
