import type { LoggedError } from "./ports";

export const MAX_FRAMES = 10;

const NAME = /^[A-Za-z][A-Za-z0-9_$.]{0,63}$/;
const FUNCTION_NAME = /^[\w$.<> [\]]+$/;
const FILE_NAME = /^[\w$.@:<>-]+$/;
const POSITION = /:\d+:\d+$/;
const SCHEME = /^[A-Za-z][A-Za-z0-9+.-]*:\/\//;
const QUERY = /[?#].*/;

const stripQuery = (text: string): string => text.replace(QUERY, "");

/** The last path segment of a location, or nothing when it is not a plain file name. */
const fileName = (url: string): string | undefined => {
  // A URL has a real query that may contain slashes; in a file path `?` is only a character.
  const path = SCHEME.test(url) ? stripQuery(url) : url;
  const name = stripQuery(path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1));
  return FILE_NAME.test(name) ? name : undefined;
};

/** `main.js:10:5` from `C:\Users\…\main.js:10:5`; nothing for a location we cannot reduce safely. */
const reduceLocation = (raw: string): string | undefined => {
  if (raw === "<anonymous>") return raw;
  const position = POSITION.exec(raw);
  if (position === null) return undefined;
  const name = fileName(raw.slice(0, position.index));
  return name === undefined ? undefined : `${name}${position[0]}`;
};

const buildFrame = (name: string | undefined, rawLocation: string): string | undefined => {
  const location = reduceLocation(rawLocation);
  if (location === undefined) return undefined;
  if (name === undefined || name === "") return location;
  return FUNCTION_NAME.test(name) ? `${name} (${location})` : undefined;
};

/** V8 (Chromium, Electron, Node): `at fn (location)` or `at location`. */
const parseV8 = (body: string): string | undefined => {
  const open = body.indexOf(" (");
  if (open > 0 && body.endsWith(")"))
    return buildFrame(body.slice(0, open), body.slice(open + 2, -1));
  return buildFrame(undefined, body);
};

/** JavaScriptCore and Firefox: `fn@location` or `@location`. */
const parseJavaScriptCore = (text: string): string | undefined => {
  const at = text.indexOf("@");
  return at < 0 ? undefined : buildFrame(text.slice(0, at), text.slice(at + 1));
};

/** A frame without any name or path except the function and the file's last segment; or nothing. */
const parseFrame = (line: string): string | undefined => {
  const text = line.trim();
  return text.startsWith("at ") ? parseV8(text.slice(3)) : parseJavaScriptCore(text);
};

const parseFrames = (stack: string): readonly string[] =>
  stack
    .split("\n")
    .flatMap((line) => {
      const frame = parseFrame(line);
      return frame === undefined ? [] : [frame];
    })
    .slice(0, MAX_FRAMES);

/** `instanceof` fails for an Error from another realm, such as an Obsidian pop-out window. */
const isError = (cause: unknown): cause is Error =>
  cause instanceof Error || Object.prototype.toString.call(cause) === "[object Error]";

const describeNonError = (cause: unknown): string => {
  try {
    return String(cause);
  } catch {
    return "[unprintable]";
  }
};

/**
 * Turns anything that was thrown into what the log may hold. The name is a strict identifier
 * and the frames carry no path or file name except the last path segment, so both are safe for
 * the diagnostics report. The message is raw and meant for the console only.
 */
export const toLoggedError = (cause: unknown): LoggedError => {
  if (!isError(cause)) return { name: "NonError", message: describeNonError(cause), frames: [] };
  const message = typeof cause.message === "string" ? cause.message : "";
  const name = typeof cause.name === "string" && NAME.test(cause.name) ? cause.name : "Error";
  // V8 puts `name: message` first, and a message can have lines that look like frames.
  const frames =
    typeof cause.stack === "string" ? parseFrames(cause.stack.replace(message, "")) : [];
  return { name, message, frames };
};
