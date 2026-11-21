// The public face of the shell's application layer (ADR 0006): other modules, other layers and the
// composition files import only this.
export { reportDefect } from "./defects";
export { deviceStoreInMemory } from "./device-store";
export {
  ClipboardError,
  ReadOnlySettingsError,
  StorageError,
  VaultReadError,
  type ShellError,
  type UpdateSettingsError,
} from "./errors";
export { EventBus, EventBusLive } from "./event-bus";
export { changesMarkdownFiles, type ShellEvents } from "./events";
export { PRODUCT_NAME, type Language, type ShellCatalog } from "./i18n/catalog";
export { shellDe } from "./i18n/de";
export { describeIssues, greetingOf } from "./i18n/describe";
export { shellEn } from "./i18n/en";
export { toLoggedError } from "./logged-error";
export { LoggerLive, type LoggerOptions } from "./logger";
export {
  Clipboard,
  DeviceStore,
  HostInfo,
  Incidents,
  LogSink,
  Logger,
  Messages,
  Notifier,
  SettingsStore,
  VaultReader,
  type DeviceValue,
  type LogEntry,
} from "./ports";
export type { ShellServices } from "./services";
export { SettingsService, SettingsServiceLive, type SettingsStatus } from "./settings-service";
export {
  copyDiagnostics,
  countMarkdownFiles,
  setLogLevel,
  showGreeting,
  updateGreeting,
} from "./use-cases";
export {
  describeDefect,
  describeShellError,
  type UserMessage,
  type UserMessageAction,
} from "./user-messages";
