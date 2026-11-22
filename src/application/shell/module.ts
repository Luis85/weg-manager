import { defineModule } from "../module";
import { shellCommands } from "./commands";
import { shellDe } from "./i18n/de";
import { shellEn } from "./i18n/en";
import { describeShellError } from "./user-messages";

/**
 * The shell's application side (ADR 0006): its texts, its errors and its commands. Its services
 * are built from the host's adapters (`appServicesLayer`), and the settings screen's route from
 * every module's sections (`src/application/routes.ts`).
 */
export const shellModule = defineModule({
  name: "shell",
  catalog: { de: shellDe, en: shellEn },
  errors: {
    tags: {
      StorageError: true,
      ReadOnlySettingsError: true,
      InvalidSettingsError: true,
      VaultReadError: true,
      ClipboardError: true,
    },
    describe: describeShellError,
  },
  commands: shellCommands,
});
