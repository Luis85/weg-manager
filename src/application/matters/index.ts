// The public face of the matters module's application layer (ADR 0006): other layers and the
// composition files import only this.
export {
  InvalidDueChangeError,
  InvalidHistoryEntryError,
  InvalidMatterError,
  InvalidMergeError,
  InvalidSplitError,
  InvalidSourceError,
  InvalidStatusChangeError,
  InvalidTodoError,
} from "./errors";
export { addHistoryEntry, changeDue, changeStatus, matterHistory } from "./history";
export { describeMatterIssue, describeSourceIssue, describeTodoIssue } from "./i18n/describe";
export { mergeMatters, splitMatter } from "./lineage";
export { shownName, type Matter } from "./list";
export { mattersModule } from "./module";
export { MATTERS } from "./routes";
export { createMatter, matterList, matterListChanges, updateMatter } from "./use-cases";
export {
  completeTodo,
  createTodo,
  todoList,
  todoListChanges,
  updateTodo,
  type Todo,
} from "./todos";
export {
  canMove,
  captureSource,
  openSourceFile,
  plannedPaths,
  sourceFiles,
  sourceList,
  sourceListChanges,
  sourceText,
  type Source,
} from "./sources";
