import { Schema, SchemaGetter } from "effect";

/** The folder the plugin's notes live in, relative to the vault root (ADR 0007). */
export const DEFAULT_ROOT_FOLDER = "WEG Manager";

/** Counted after normalising. Leaves room for the folders and file names below it. */
export const ROOT_FOLDER_MAX_LENGTH = 100;

/** What Obsidian forbids in a file name (`/` is the separator), and control characters. */
const FORBIDDEN_IN_NAME = /[*"\\<>:|?\p{Cc}]/u;

/** Trims the value and each segment, and drops leading and trailing slashes. */
const normalise = (value: string): string =>
  value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map((segment) => segment.trim())
    .join("/");

const isFolderPath = (value: string): boolean =>
  value
    .split("/")
    .every(
      (segment) =>
        segment !== "" && segment !== "." && segment !== ".." && !FORBIDDEN_IN_NAME.test(segment),
    );

/**
 * A vault-relative folder path with `/` between the names, stored normalised: no leading or
 * trailing slash, no empty, `.` or `..` name, none of the characters Obsidian forbids in a name.
 */
export const RootFolder = Schema.String.pipe(
  Schema.decodeTo(
    Schema.String.check(
      Schema.makeFilter(isFolderPath),
      Schema.isMaxLength(ROOT_FOLDER_MAX_LENGTH),
    ),
    {
      decode: SchemaGetter.transform(normalise),
      encode: SchemaGetter.passthrough(),
    },
  ),
);
