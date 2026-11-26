import { NAME_MAX_LENGTH } from "../../../domain/contacts";
import type { ContactsCatalog } from "./catalog";

/** English, sentence case: first the cause, then the action. */
export const contactsEn: ContactsCatalog = {
  route: "Contacts",
  screen: {
    title: "Contacts",
    intro: (folder) => `Each contact is a note in the folder "${folder}".`,
    add: "Add contact",
    loading: "Loading contacts …",
    empty:
      "People and companies appear here with their role in each community, such as the manager.",
    edit: "Edit",
    editLabel: (name) => `Edit ${name}`,
    readOnly: "Read-only",
    showInactive: "Show inactive contacts",
    hiddenInactive: (count) =>
      count === 1 ? "1 inactive contact hidden" : `${count} inactive contacts hidden`,
    private: "Private",
    inactive: "Inactive",
    worksFor: (company) => `at ${company}`,
    people: (names) => `People: ${names}`,
    roleIn: (role, community) => `${role} (${community})`,
  },
  fields: {
    name: "Name",
    kind: "Kind",
    organization_id: "Company",
    roles: "Roles",
    email: "Email",
    phone: "Phone",
    language: "Language",
    private: "Private",
    inactive: "Inactive",
  },
  kinds: { person: "Person", company: "Company" },
  roles: {
    board: "Board member",
    deputy: "Deputy",
    owner: "Owner",
    manager: "Manager",
    other_board: "Board of another community",
    third_party: "Third party",
    agent: "Agent",
  },
  languages: { de: "German", "de+en": "German and English" },
  form: {
    createTitle: "New contact",
    editTitle: "Edit contact",
    save: "Save",
    cancel: "Cancel",
    community: "Community",
    role: "Role",
    addRole: "Add role",
    removeRole: (community) => `Remove role in ${community}`,
    noRole: "No role yet",
    noCommunities: 'Add a community under "Settings" first.',
    noCompany: "No company",
    newCompany: "New company …",
    newCompanyName: "Name of the new company",
    newCompanyHint: "The company is added as a contact of its own when you save.",
    noLanguage: "Not given",
    privateLocked: "Owners are always private.",
    privateHelp: "The plugin copies nothing from private contacts into drafts, cards or reports.",
    inactiveHelp: "The contact stays, so older matters and messages still make sense.",
    sameName: (names) =>
      `A contact with this name exists already: ${names}. Check whether you mean it.`,
  },
  missing: {
    name: "Enter a name.",
    kind: "Choose whether it is a person or a company.",
    roles: "Add at least one role in a community.",
  },
  issues: {
    "name.invalid": (_, label) =>
      `Enter one line of at most ${NAME_MAX_LENGTH} characters for "${label}".`,
    "name.too-long": (_, label) =>
      `"${label}" makes a file name that is too long, because some characters take more space. Shorten the name.`,
    "kind.unknown": () => "The kind is neither person nor company. Choose one.",
    "organization.not-company": () =>
      "Only a person can belong to a company, and only to a contact of the kind company. Choose a company or none.",
    "roles.invalid": () =>
      "A role is not a community with a role. Choose the community and the role again.",
    "roles.missing": () => "Add at least one role in a community.",
    "roles.duplicate-community": () => "One community has two roles. Keep one role per community.",
    "roles.community-missing": () =>
      "A role names a community that no longer exists. Choose another one or remove the role.",
    "email.invalid": () => "The email address needs an @ with text before and after it.",
    "phone.invalid": () => "Enter the phone number in one line of at most 50 characters.",
    "language.unknown": () => "The plugin does not know this language. Choose one from the list.",
    "private.missing": () => 'An owner is not marked private. Set the mark "Private".',
  },
  errors: {
    invalid: {
      title: "Contact not saved",
      detail: "Some details are missing or do not fit. Correct the marked fields and save again.",
    },
  },
};
