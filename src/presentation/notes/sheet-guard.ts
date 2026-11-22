import { inject, provide, type InjectionKey } from "vue";

/** Where a record form reports whether it holds unsaved input: the record screen around it. */
type DirtyReport = (dirty: boolean) => void;

const SHEET_GUARD_KEY: InjectionKey<DirtyReport> = Symbol("weg-manager/record-sheet-guard");

/**
 * Lets the record forms below this component report whether they hold unsaved input (PBI-72);
 * `useRecordScreen` calls it, so its sheet asks before it discards that input.
 */
export const provideSheetGuard = (report: DirtyReport): void => {
  provide(SHEET_GUARD_KEY, report);
};

/** The report of the record screen around a form; none outside a record screen. */
export const useSheetGuard = (): DirtyReport => inject(SHEET_GUARD_KEY, () => undefined);
