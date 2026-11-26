import { computed } from "vue";
import type { Community } from "../../application/communities";
import { shownName as contactName, type Contact } from "../../application/contacts";
import {
  createMatter,
  describeMatterIssue,
  updateMatter,
  type Matter,
} from "../../application/matters";
import {
  MATTER_KINDS,
  MATTER_STATUSES,
  matterType,
  nextNumber,
  validateMatter,
  type MatterInput,
} from "../../domain/matters";
import { useRecordForm } from "../notes";
import { useMessages } from "../shell";

/** A choice of a native select: its value and what it shows. */
type Choice = { readonly value: string; readonly label: string };

/**
 * The matter form's rules (PBI-05) on the notes module's record form (`useRecordForm`): the
 * validators call `validateMatter` against the other matters. A new matter gets its number on
 * save (the rules check it as the next one), starts open and in the selected community. The
 * choices of community, kind, responsible contact and status come from here. `done` gets the id
 * of the matter that was saved.
 */
export const useMatterForm = (options: {
  readonly matter: Matter | undefined;
  readonly matters: () => readonly Matter[];
  readonly communities: () => readonly Community[];
  readonly contacts: () => readonly Contact[];
  /** The selected community: where a new matter starts. */
  readonly community: string | undefined;
  readonly root: () => HTMLElement | undefined;
  readonly done: (id: string) => void;
}) => {
  const catalog = useMessages();
  const t = catalog.matters;
  const { matter } = options;

  const others = computed(() =>
    options
      .matters()
      .filter((other) => matter === undefined || other.id !== matter.id)
      .map((other) => ({ id: other.id, number: other.values.number })),
  );
  /** The number a new matter will get; the rules check it so. */
  const next = computed(() =>
    nextNumber(others.value.flatMap((other) => (other.number === undefined ? [] : [other.number]))),
  );
  const effective = (input: MatterInput): MatterInput =>
    matter === undefined ? { ...input, number: next.value } : input;

  const record = useRecordForm({
    type: matterType,
    record: matter,
    initial: matter === undefined ? { status: "open", community_id: options.community ?? "" } : {},
    create: createMatter,
    update: updateMatter,
    invalid: "InvalidMatterError",
    rules: (input) =>
      validateMatter(effective(input), {
        others: others.value,
        loaded:
          matter === undefined
            ? undefined
            : { number: matter.values.number, outcome: matter.values.outcome },
      }),
    describe: (issue) => describeMatterIssue(issue, catalog),
    labels: t.fields,
    summary: t.errors.invalid,
    root: options.root,
    done: options.done,
  });

  const choose: Choice = { value: "", label: t.form.choose };
  const communities = computed((): readonly Choice[] => [
    choose,
    ...options
      .communities()
      .flatMap((community) =>
        community.id === undefined
          ? []
          : [{ value: community.id, label: community.values.name ?? community.fileName }],
      ),
  ]);
  const contacts = computed((): readonly Choice[] => [
    choose,
    ...options
      .contacts()
      .flatMap((contact) =>
        contact.id === undefined ||
        (contact.values.inactive === true && contact.id !== matter?.values.responsible_id)
          ? []
          : [{ value: contact.id, label: contactName(contact) }],
      ),
  ]);
  const kinds: readonly Choice[] = [
    choose,
    ...MATTER_KINDS.map((kind) => ({ value: kind, label: t.kinds[kind] })),
  ];
  const statuses: readonly Choice[] = MATTER_STATUSES.map((status) => ({
    value: status,
    label: t.statuses[status],
  }));

  return { ...record, t, communities, contacts, kinds, statuses, isNew: matter === undefined };
};
