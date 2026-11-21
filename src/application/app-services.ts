import type { ManagedRuntime } from "effect";
import type { Clipboard, HostInfo, Incidents, Logger, Notifier, VaultReader } from "./ports";
import type { SettingsService } from "./settings-service";

/** Everything a use case may require; the runtime of one plugin load provides all of it. */
export type AppServices =
  SettingsService | Notifier | VaultReader | Logger | Incidents | Clipboard | HostInfo;

/** The runtime of one plugin load; presentation runs use cases through it. */
export type AppRuntime = ManagedRuntime.ManagedRuntime<AppServices, never>;
