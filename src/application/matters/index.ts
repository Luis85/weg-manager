// The public face of the matters module's application layer (ADR 0006): other layers and the
// composition files import only this.
export { InvalidHistoryEntryError, InvalidMatterError, InvalidStatusChangeError } from "./errors";
export { addHistoryEntry, changeStatus, matterHistory } from "./history";
export { describeMatterIssue } from "./i18n/describe";
export { shownName, type Matter } from "./list";
export { mattersModule } from "./module";
export { MATTERS } from "./routes";
export { createMatter, matterList, matterListChanges, updateMatter } from "./use-cases";
