import type { EventBus } from "./event-bus";
import type {
  Clipboard,
  DeviceStore,
  HostInfo,
  Incidents,
  Logger,
  Messages,
  Notifier,
} from "./ports";
import type { SettingsService } from "./settings-service";

/** The services the shell provides to every use case; part of `AppServices`. */
export type ShellServices =
  | SettingsService
  | Notifier
  | Logger
  | Incidents
  | Clipboard
  | HostInfo
  | Messages
  | EventBus
  | DeviceStore;
