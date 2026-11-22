import { computed, shallowRef } from "vue";
import { rebuildNoteIndex, recordFolder, type RecordList } from "../../application/notes";
import { describeError } from "../../application/user-messages";
import type { NoteFields, NoteType } from "../../domain/notes";
import { useCommand, useDelayed, useMessages, useModal, useSettings } from "../shell";
import { cardKey, useFocusAfter } from "./focus-after";

/** What the screen needs to know of a record: its identity, for its card and the focus. */
type ScreenRecord = Parameters<typeof cardKey>[0];

/**
 * The state of a screen that lists the records of one type and edits them in a sheet (VIEW-07):
 * where new notes go, loading (shown after 300 ms), the index's failure with a retry, the empty
 * state, and which record the sheet and the delete dialog are about. The sheet and the dialog are
 * modal (`useModal`); when one closes, the focus goes to the card it was about once the list shows
 * it, after a create or save to the saved card, after a delete to the create action
 * (`useFocusAfter`). The feature keeps the markup: cards marked with `data-card-key` and
 * `data-focus`, the sheet and the dialog bound to `sheet` and `dialog`.
 */
export const useRecordScreen = <F extends NoteFields, Row extends ScreenRecord>(options: {
  readonly type: NoteType<F>;
  /** The list as the screen follows it (`useStream` of the feature's list and changes). */
  readonly list: () => RecordList<Row>;
  readonly root: () => HTMLElement | undefined;
}) => {
  const catalog = useMessages();
  const settings = useSettings();
  const rebuild = useCommand(() => rebuildNoteIndex);
  const focus = useFocusAfter(options.root, () => options.list().records);

  /** The sheet: closed, a new record, or one being edited. */
  const editing = shallowRef<{ readonly record: Row | undefined } | undefined>();
  const deleting = shallowRef<Row | undefined>();
  /** One dialog per record: a delete still running after a cancel lands in no other's. */
  const deletingKey = computed(() => deleting.value?.path ?? "");

  const folder = computed(() => recordFolder(settings.value.rootFolder, options.type));
  const loading = computed(() => !options.list().ready && options.list().failure === undefined);
  const loadingShown = useDelayed(() => loading.value);
  const failure = computed(() => {
    const { failure: error } = options.list();
    return error === undefined ? undefined : describeError(error, catalog);
  });
  const empty = computed(() => options.list().ready && options.list().records.length === 0);
  const sheetOpen = computed({
    get: () => editing.value !== undefined,
    set: (open: boolean) => {
      if (!open) editing.value = undefined;
    },
  });
  const sheet = useModal(() => sheetOpen.value, focus.closed);
  const dialog = useModal(() => deleting.value !== undefined, focus.closed);

  return {
    folder,
    loading,
    loadingShown,
    failure,
    empty,
    retry: () => rebuild.run(),
    editing,
    deleting,
    deletingKey,
    sheetOpen,
    sheet,
    dialog,
    create: () => {
      focus.opened({ add: true });
      editing.value = { record: undefined };
    },
    edit: (record: Row) => {
      focus.opened({ card: cardKey(record) });
      editing.value = { record };
    },
    /** The sheet saved the record with `id`: it closes, and the focus goes to its card. */
    saved: (id: string) => {
      focus.after({ card: `id:${id}` });
      editing.value = undefined;
    },
    close: () => {
      editing.value = undefined;
    },
    remove: (record: Row) => {
      focus.opened({ card: cardKey(record), control: "remove" });
      deleting.value = record;
    },
    /** The dialog deleted its record: the focus goes to the create action once the card is gone. */
    removed: () => {
      if (deleting.value !== undefined) focus.after({ add: true, gone: cardKey(deleting.value) });
    },
    closeDelete: () => {
      deleting.value = undefined;
    },
  };
};
