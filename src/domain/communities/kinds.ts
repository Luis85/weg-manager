import { clashKey } from "../notes";

/** A kind with the unit label that goes with it, as a community note holds them. */
export type KindPair = { readonly kind: string; readonly unit_label: string };

const keyOf = ({ kind, unit_label }: KindPair) =>
  `${clashKey(kind.trim())}\u0000${clashKey(unit_label.trim())}`;

/**
 * The pairs the form suggests (PBI-56): the built-in ones first, then each pair other communities
 * use, in their order, once. Pairs compare trimmed and without regard to case; a pair with a
 * missing or blank half is no suggestion.
 */
export const kindSuggestions = (
  builtIn: readonly KindPair[],
  used: readonly { readonly kind?: string | undefined; readonly unit_label?: string | undefined }[],
): KindPair[] => {
  const seen = new Set(builtIn.map(keyOf));
  const suggestions = [...builtIn];
  for (const { kind, unit_label } of used) {
    if (kind === undefined || unit_label === undefined) continue;
    const pair = { kind, unit_label };
    if (kind.trim() === "" || unit_label.trim() === "" || seen.has(keyOf(pair))) continue;
    seen.add(keyOf(pair));
    suggestions.push(pair);
  }
  return suggestions;
};
