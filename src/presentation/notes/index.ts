// The public face of the notes module's presentation (ADR 0006): what every record screen shares.
// It loads Vue, so `src/presentation/app-surface.ts` imports it only lazily.
export { default as ConflictChoice } from "./components/ConflictChoice.vue";
export { default as DeleteRecordDialog } from "./components/DeleteRecordDialog.vue";
export { default as OpenNoteButton } from "./components/OpenNoteButton.vue";
export { default as RecordFormFooter } from "./components/RecordFormFooter.vue";
export { default as RecordSheet } from "./components/RecordSheet.vue";
export { cardKey } from "./focus-after";
export { useRecordForm } from "./use-record-form";
export { useRecordScreen } from "./use-record-screen";
