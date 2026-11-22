// The public face of the shell's domain (ADR 0006): other modules and layers import only this.
export { localDay, untilNextLocalMidnight, type CalendarDay } from "./calendar";
export {
  DEFAULT_SETTINGS,
  LOG_LEVELS,
  SettingsIssue,
  decodeSettings,
  encodeSettings,
  validatePatch,
  type DecodedSettings,
  type EditableSettings,
  type LogLevel,
  type Settings,
} from "./settings";
export { runMigrations, type Migrations } from "./settings-codec";
