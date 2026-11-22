import type * as Obsidian from "obsidian";
import { YAMLParseError, parse, stringify } from "yaml";

/**
 * Obsidian's `parseYaml` and `stringifyYaml`. Obsidian 1.15.1 reads YAML as the `yaml` package
 * (2.9) does with its defaults (YAML 1.2, core schema; its errors are the package's
 * `YAMLParseError`), so this copy is that package: `tests/support/notes/difficult-scenario.ts`
 * holds both against the same expectation, for nested maps, block scalars, multi-line
 * texts, anchors, merge keys (kept as a `<<` key, as the 1.2 core schema does), explicit and
 * unknown tags, duplicate keys and tab indentation (both errors), `...` before more content (an
 * error) and a `null` key (read as `""`) against the real app, value for value. Only the warnings
 * the package logs for an unknown tag are silenced here. `stringifyYaml` writes as Obsidian's does:
 * the package's defaults with null as an empty value (`none:`), block lists indented by two
 * spaces, `{}` for an empty map (`STRINGIFY_SAMPLE` in `fidelity.ts`).
 */

/** The error Obsidian's parser throws (its `name` is all a caller can rely on). */
export { YAMLParseError };

/** Like Obsidian's `parseYaml`: `null` for empty text or a block of comments, else the value. */
export const parseYaml: typeof Obsidian.parseYaml = (yaml): unknown =>
  parse(yaml, { logLevel: "error" });

/** Like Obsidian's `stringifyYaml`: ends with a newline, `{}\n` when empty. */
export const stringifyYaml: typeof Obsidian.stringifyYaml = (value) =>
  stringify(value, { nullStr: "" });
