import { computed, shallowRef } from "vue";
import {
  contactNames,
  createContact,
  describeContactIssue,
  shownName,
  updateContact,
  type Contact,
} from "../../application/contacts";
import type { Community } from "../../application/communities";
import {
  contactType,
  hasOwnerRole,
  sameNameContacts,
  validateContact,
  type ContactInput,
} from "../../domain/contacts";
import { useRecordForm } from "../notes";
import { useMessages } from "../shell";

/** The company choice of a person: none, an existing company by id, or a new one by name. */
export const NEW_COMPANY = "new";

/** The input the rules and the use case see: a new company is no id yet. */
const effective = (input: ContactInput): ContactInput =>
  input.organization_id === NEW_COMPANY ? { ...input, organization_id: "" } : input;

/**
 * The contact form's rules (PBI-02) on the notes module's record form (`useRecordForm`, which
 * holds its state and flow): the validators call `validateContact` against the other contacts and
 * the communities; an owner role sets the private mark and keeps it set; a person may name a new
 * company, which the use case creates on save; a contact of the same name shows before a save.
 * `done` gets the id of the contact that was saved.
 */
export const useContactForm = (options: {
  readonly contact: Contact | undefined;
  readonly contacts: () => readonly Contact[];
  readonly communities: () => readonly Community[];
  readonly root: () => HTMLElement | undefined;
  readonly done: (id: string) => void;
}) => {
  const catalog = useMessages();
  const t = catalog.contacts;
  const { contact } = options;

  const others = computed(() =>
    options
      .contacts()
      .filter((other) => contact === undefined || other.id !== contact.id)
      .map((other) => ({ id: other.id, name: shownName(other), kind: other.values.kind })),
  );
  const communityIds = computed(
    () =>
      new Set(
        options
          .communities()
          .flatMap((community) => (community.id === undefined ? [] : [community.id])),
      ),
  );
  /** The companies a person may work for. */
  const companies = computed(() => others.value.filter((other) => other.kind === "company"));

  /** The name of a new company, while the company choice is "new". */
  const newCompany = shallowRef("");
  const saveOptions = (input: ContactInput) =>
    input.organization_id === NEW_COMPANY ? { newCompany: newCompany.value } : {};
  const record = useRecordForm({
    type: contactType,
    record: contact,
    initial: contact === undefined ? { kind: "person" } : {},
    create: (input) => createContact(effective(input), saveOptions(input)),
    update: (row, input) => updateContact(row, effective(input), saveOptions(input)),
    invalid: "InvalidContactError",
    rules: (input) =>
      validateContact(effective(input), {
        others: others.value,
        communities: communityIds.value,
        loaded: contact === undefined ? undefined : { name: contact.values.name },
      }),
    describe: (issue) => describeContactIssue(issue, catalog),
    labels: t.fields,
    references: { organization_id: contactNames },
    summary: t.errors.invalid,
    root: options.root,
    done: options.done,
  });
  const { form } = record;

  /** The roles changed: an owner role sets the private mark (PBI-02 criterion 8). */
  const rolesChanged = (roles: readonly string[], change: (value: readonly string[]) => void) => {
    change(roles);
    if (hasOwnerRole(roles)) form.setFieldValue("private", true);
  };
  /** Whether the private mark is held on by an owner role. */
  const privateLocked = form.useSelector((state) => hasOwnerRole(state.values.roles));
  /** Other contacts of the same name, shown before a save (criterion 5). */
  const sameName = form.useSelector((state) =>
    sameNameContacts(state.values.name, others.value, contact?.id).map((other) => other.name),
  );

  return { ...record, t, companies, newCompany, rolesChanged, privateLocked, sameName };
};
