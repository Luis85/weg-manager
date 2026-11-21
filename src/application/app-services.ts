import type { Clipboard, HostInfo, Incidents, Logger, Notifier, VaultReader } from "./ports";
import type { SettingsService } from "./settings-service";

/** Everything a use case may require; the runtime of one plugin load provides all of it. */
export type AppServices =
  SettingsService | Notifier | VaultReader | Logger | Incidents | Clipboard | HostInfo;
