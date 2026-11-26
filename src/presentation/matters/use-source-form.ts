import { useForm } from "@tanstack/vue-form";
import { computed, shallowRef, watch } from "vue";
import {
  canMove,
  captureSource,
  describeSourceIssue,
  plannedPaths,
  sourceList,
  sourceListChanges,
  type Matter,
} from "../../application/matters";
import type { PickedFile } from "../../application/notes";
import {
  SOURCE_KINDS,
  validateSource,
  type SourceInput,
  type SourceKind,
} from "../../domain/matters";
import { useCommand, useMessages, useQuery, useStream } from "../shell";
import { whenWritten } from "./use-history";

/** What the capture form holds besides the files. */
type Values = {
  subject: string;
  kind: SourceKind;
  received_on: string;
  origin: string;
  message_ref: string;
  link: string;
  text: string;
  move: boolean;
};
type Field = "subject" | "kind" | "received_on" | "origin" | "message_ref" | "link";

/** Reads the files the user picked: name, content and the `File` itself for a move. */
const readPicked = (files: FileList | null): Promise<PickedFile[]> =>
  Promise.all(
    [...(files ?? [])].map(async (file) => ({
      name: file.name,
      bytes: new Uint8Array(await file.arrayBuffer()),
      handle: file,
    })),
  );

/**
 * The capture of a source for `matter` (PBI-11): TanStack Form whose validators call
 * `validateSource`; the picked files, whether they can be moved, and the vault paths they will
 * get, read again whenever subject, kind, day or files change. `done` runs once it is written.
 */
export const useSourceForm = (matter: () => Matter, today: string, done: () => void) => {
  const catalog = useMessages();
  const t = catalog.matters.sources;
  const command = useCommand(captureSource);
  const files = shallowRef<PickedFile[]>([]);
  const movable = useQuery(canMove);
  const targets = useQuery(plannedPaths);
  const input = (values: Values): SourceInput => ({
    subject: values.subject,
    kind: values.kind,
    community_id: matter().values.community_id ?? "",
    matter_ids: matter().id === undefined ? [] : [matter().id ?? ""],
    received_on: values.received_on,
    origin: values.origin,
    message_ref: values.message_ref,
    link: values.link,
    files: [],
  });
  const defaults: Values = {
    subject: "",
    kind: "mail",
    received_on: today,
    origin: "",
    message_ref: "",
    link: "",
    text: "",
    move: false,
  };
  const form = useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) =>
      whenWritten(done)(
        await command.run({
          input: input(value),
          text: value.text,
          files: files.value,
          move: value.move && movable.value.value === true,
        }),
      ),
  });
  const filing = form.useSelector((state) => ({
    community_id: matter().values.community_id ?? "",
    kind: state.values.kind,
    subject: state.values.subject,
    received_on: state.values.received_on,
  }));
  watch(
    [() => filing.value.kind, () => filing.value.subject, () => filing.value.received_on, files],
    () => void targets.run(filing.value, files.value),
    { immediate: true },
  );
  const pick = async (list: FileList | null) => {
    files.value = await readPicked(list);
    void movable.run(files.value);
  };
  const issueOf =
    (key: Field) =>
    ({ value }: { value: string }) => {
      const issue = validateSource(input({ ...form.state.values, [key]: value }), {
        matterCommunities: new Map(),
      }).find((each) => each.key === key);
      return issue === undefined ? undefined : describeSourceIssue(issue, catalog);
    };
  const validators = (key: Field) => ({ onSubmit: issueOf(key) });
  const kinds = SOURCE_KINDS.map((kind) => ({ value: kind, label: t.kinds[kind] }));
  const canMoveFiles = computed(() => files.value.length > 0 && movable.value.value === true);
  return { t, form, command, validators, kinds, files, pick, canMoveFiles, targets };
};

/** The sources of `matter`, newest first (PBI-11 criterion 6). */
export const useMatterSources = (matter: () => Matter) => {
  const list = useStream(sourceList, sourceListChanges);
  return computed(() =>
    list.value.records.filter(
      (source) =>
        matter().id !== undefined && (source.values.matter_ids ?? []).includes(matter().id ?? ""),
    ),
  );
};
