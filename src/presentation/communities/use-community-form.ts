import { computed } from "vue";
import {
  canChangeShortCode,
  createCommunity,
  describeCommunityIssue,
  shownName,
  updateCommunity,
  type Community,
} from "../../application/communities";
import {
  colorOwners,
  communityType,
  firstFreeColor,
  kindSuggestions,
  validateCommunity,
  type CommunityInput,
  type CommunityKey,
  type KindPair,
} from "../../domain/communities";
import { useRecordForm } from "../notes";
import { useMessages } from "../shell";

/**
 * The community form's rules (handoff CommunityForm) on the notes module's record form
 * (`useRecordForm`, which holds its state and flow): the validators call `validateCommunity`
 * against the other communities; the short code is fixed once given (`canChangeShortCode`); a new
 * community starts with the first free colour; the colours other communities use are taken; and
 * the kind suggests its unit label. `done` gets the id of the community that was saved.
 */
export const useCommunityForm = (options: {
  readonly community: Community | undefined;
  readonly communities: () => readonly Community[];
  readonly root: () => HTMLElement | undefined;
  readonly done: (id: string) => void;
}) => {
  const catalog = useMessages();
  const t = catalog.communities;
  const { community } = options;
  const loaded = community?.values;
  const shortCodeEditable = community === undefined || canChangeShortCode(community);

  /** The other communities' valid values and the name each is shown by: what the rules compare. */
  const others = computed(() =>
    options
      .communities()
      .filter((other) => community === undefined || other.id !== community.id)
      .map((other) => ({ ...other.values, name: shownName(other) })),
  );
  /** The colours other communities use, each with its owner's short code. */
  const taken = computed(() => {
    const owners = new Map(colorOwners(others.value));
    if (loaded?.color !== undefined) owners.delete(loaded.color);
    return owners;
  });
  const suggestions = computed(() => kindSuggestions(t.builtInKinds, others.value));

  /** What the rules see: a fixed short code stays as loaded, whatever the field holds. */
  const effective = (input: CommunityInput): CommunityInput =>
    shortCodeEditable ? input : { ...input, short_code: loaded?.short_code ?? input.short_code };

  const record = useRecordForm({
    type: communityType,
    record: community,
    initial: community === undefined ? { color: firstFreeColor(others.value) ?? "" } : {},
    create: createCommunity,
    update: updateCommunity,
    invalid: "InvalidCommunityError",
    rules: (input) => {
      const issues = validateCommunity(effective(input), { others: others.value, loaded });
      return shortCodeEditable ? issues : issues.filter((issue) => issue.key !== "short_code");
    },
    describe: (issue) => describeCommunityIssue(issue, catalog),
    labels: t.fields,
    summary: t.errors.invalid,
    root: options.root,
    done: options.done,
  });
  const { form } = record;

  /** Choosing a kind fills its unit label, which stays editable. */
  const choose = (pair: KindPair) => {
    form.setFieldValue("kind", pair.kind);
    form.setFieldValue("unit_label", pair.unit_label);
  };
  /** What the user typed into a text field; a typed kind that is a suggestion fills its label. */
  const typed = (key: CommunityKey, change: (value: string) => void, value: string) => {
    change(value);
    if (key !== "kind") return;
    const pair = suggestions.value.find((candidate) => candidate.kind === value.trim());
    if (pair !== undefined) form.setFieldValue("unit_label", pair.unit_label);
  };

  return { ...record, t, shortCodeEditable, taken, suggestions, choose, typed };
};
