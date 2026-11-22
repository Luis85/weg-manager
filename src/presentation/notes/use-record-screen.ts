import { computed, shallowRef } from "vue";
import { rebuildNoteIndex, recordFolder, type RecordList } from "../../application/notes";
import { describeError } from "../../application/user-messages";
import type { NoteFields, NoteType } from "../../domain/notes";
import { useCommand, useDelayed, useMessages, useModal, useSettings } from "../shell";
import { cardKey, useFocusAfter } from "./focus-after";
import { provideSheetGuard } from "./sheet-guard";

/**
 * The element that has the focus in `root`'s document. Checked against that document's own
 * `HTMLElement`: the global one fails for an element in a pop-out window.
 */
const focusedIn = (root: HTMLElement | undefined): HTMLElement | undefined => {
  const focused = root?.ownerDocument.activeElement;
  const view = root?.ownerDocument.defaultView;
  return view !== null && view !== undefined && focused instanceof view.HTMLElement
    ? focused
    : undefined;
};

/** What `RecordSheet` takes of a record screen: the sheet and the question before discarding. */
export type RecordSheetState = Pick<
  ReturnType<typeof useRecordScreen>,
  | "sheetOpen"
  | "sheet"
  | "sheetDismissible"
  | "discarding"
  | "discardDialog"
  | "requestClose"
  | "keep"
  | "discard"
>;

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
 *
 * A sheet whose form holds unsaved input does not close by itself (PBI-72): Escape, a pointer-down
 * outside, its close control and the form's cancel (`close`) ask first (`discarding`), with keep
 * editing as the safe choice; `RecordSheet` shows the sheet and the question. A save closes it at
 * once, and so does every way without unsaved input.
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
  /** The open form holds unsaved input, as it reports (`useRecordForm`). */
  const dirty = shallowRef(false);
  provideSheetGuard((next) => {
    dirty.value = next;
  });
  /** The question whether to discard that input is open. */
  const discarding = shallowRef(false);
  /** Where the focus was when the question opened: keep editing returns it there. */
  let returnTo: HTMLElement | undefined;
  const shut = () => {
    discarding.value = false;
    editing.value = undefined;
  };
  /** Every way to close the sheet: at once without unsaved input, else the question first. */
  const requestClose = () => {
    if (editing.value === undefined || discarding.value) return;
    if (!dirty.value) return shut();
    returnTo = focusedIn(options.root());
    discarding.value = true;
  };
  const sheetOpen = computed({
    get: () => editing.value !== undefined,
    set: (open: boolean) => {
      if (!open) requestClose();
    },
  });
  const sheet = useModal(() => sheetOpen.value, focus.closed);
  const dialog = useModal(() => deleting.value !== undefined, focus.closed);
  const discardDialog = useModal(
    () => discarding.value,
    () => {
      // Kept: back to where the focus was. Discarded: the sheet's close decides.
      if (editing.value !== undefined && returnTo?.isConnected === true) returnTo.focus();
      returnTo = undefined;
    },
  );

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
    /** The sheet closes by itself only without unsaved input; else it asks. */
    sheetDismissible: computed(() => !dirty.value),
    discarding,
    discardDialog,
    requestClose,
    /** Keep editing: the question closes, the input stays. */
    keep: () => {
      discarding.value = false;
    },
    /** Discard the input: the question and the sheet close. */
    discard: shut,
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
      shut();
    },
    /** The form's cancel: closes, or asks first while the form holds unsaved input. */
    close: requestClose,
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
