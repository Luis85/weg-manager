import { Layer } from "effect";
import { LogSink, type LogEntry } from "../../application/ports";

const PREFIX = "[weg-manager]";

/**
 * The only place in shipped code that writes to the console (Twelve-Factor XI: logs as a stream).
 * Obsidian's guidelines allow only warn, error and debug, so info goes to debug as well.
 */
const write = (entry: LogEntry): void => {
  const details = { data: entry.data, error: entry.error, incidentId: entry.incidentId };
  switch (entry.level) {
    case "error":
      console.error(PREFIX, entry.event, details);
      return;
    case "warn":
      console.warn(PREFIX, entry.event, details);
      return;
    case "info":
    case "debug":
      console.debug(PREFIX, entry.event, details);
  }
};

/** Direct access for the last-resort path when no runtime is available. */
export const consoleSink = { write };

export const consoleSinkLayer = Layer.succeed(LogSink)(consoleSink);
