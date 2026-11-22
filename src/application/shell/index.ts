// The public face of the shell's application layer (ADR 0006): other modules, other layers and the
// composition files import only this.
export { shellCommands, type CommandAction, type PluginCommand } from "./commands";
export { reportDefect, reportUnexpected } from "./defects";
export {
  ClipboardError,
  ReadOnlySettingsError,
  StorageError,
  VaultReadError,
  type ShellError,
  type UpdateSettingsError,
} from "./errors";
export { EventBus, EventBusLive } from "./event-bus";
export type { ShellEvents } from "./events";
export { PRODUCT_NAME, type Language, type ShellCatalog } from "./i18n/catalog";
export { shellDe } from "./i18n/de";

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
  type DeviceValue,
  type LogEntry,
} from "./ports";
export { historyAt, stepBack, stepForward, visit, type RouteHistory } from "./history";
export { routesOf, type RouteLike, type Routes } from "./routes";
export type { ShellServices } from "./services";
export { SettingsService, SettingsServiceLive, type SettingsStatus } from "./settings-service";
export { copyDiagnostics, setLogLevel } from "./use-cases";
export {
  describeDefect,
  describeShellError,
  type UserMessage,
  type UserMessageAction,
} from "./user-messages";
