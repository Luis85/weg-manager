import { Clock, Effect, Layer } from "effect";
import { LOG_LEVELS, type LogLevel } from "../../domain/shell";
import { LogSink, Logger, type LogEntry, type RecordedLogEntry } from "./ports";
import { SettingsService } from "./settings-service";

export const RECENT_LOG_LIMIT = 50;

const rank = (level: LogLevel): number => LOG_LEVELS.indexOf(level);

export type LoggerOptions = {
  /** In development builds every level is written regardless of the setting. */
  readonly developmentMode: boolean;
};

/**
 * Structured logging (Twelve-Factor XI): filters by the `logLevel` setting at the time of each call,
 * keeps the last entries for diagnostics and forwards accepted entries to the sink.
 */
export const LoggerLive = (options: LoggerOptions) =>
  Layer.effect(
    Logger,
    Effect.gen(function* () {
      const settings = yield* SettingsService;
      const sink = yield* LogSink;
      const recent: RecordedLogEntry[] = [];

      const log = (entry: LogEntry) =>
        Effect.gen(function* () {
          const minimum = options.developmentMode ? "debug" : (yield* settings.current).logLevel;
          if (rank(entry.level) > rank(minimum)) return;
          const at = yield* Clock.currentTimeMillis;
          recent.push({ ...entry, at });
          if (recent.length > RECENT_LOG_LIMIT) recent.shift();
          sink.write(entry);
        });

      return Logger.of({ log, recent: Effect.sync(() => [...recent]) });
    }),
  );
