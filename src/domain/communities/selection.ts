/**
 * The community selection rule (ADR 0008, PBI-56): the stored community while it exists; with
 * nothing stored or the stored one gone, the only community if there is exactly one, otherwise
 * none, and the frame asks for a choice. `ids` are the communities that can be selected.
 */
export const selectedCommunity = (
  stored: string | undefined,
  ids: readonly string[],
): string | undefined => {
  if (stored !== undefined && ids.includes(stored)) return stored;
  return ids.length === 1 ? ids[0] : undefined;
};
