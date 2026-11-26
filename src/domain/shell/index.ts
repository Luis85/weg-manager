// The public face of the shell's domain (ADR 0006): other modules and layers import only this.
export { localDay, untilNextLocalMidnight, type CalendarDay, type TimeZone } from "./calendar";
export {
  DEFAULT_SETTINGS,
  LOG_LEVELS,
  SettingsIssue,
  WEEKDAYS,
  WEEK_LIMITS,
  decodeSettings,
  encodeSettings,
  validatePatch,
  type DecodedSettings,
  type EditableSettings,
  type LogLevel,
  type Settings,
  type Weekday,
} from "./settings";
export { runMigrations, type Migrations } from "./settings-codec";
