import { createHash } from "node:crypto";
import { isObject, pyJson, type Json, type JsonObject } from "./json.ts";

/** Expected rejection of the input or the target; reported, never a crash. */
export class ImportInputError extends Error {
  override readonly name = "ImportInputError";
}

export const fail = (message: string): never => {
  throw new ImportInputError(message);
};

const SECRET_KEYS = new Set(["access_token", "refresh_token", "password", "client_secret"]);
const BODY_STATUSES = new Set(["complete", "partial", "unavailable"]);
const BODY_FORMATS = new Set(["plain", "html", "markdown"]);

export const rejectCredentials = (value: unknown): void => {
  if (Array.isArray(value)) value.forEach(rejectCredentials);
  else if (isObject(value)) {
    if (Object.keys(value).some((key) => SECRET_KEYS.has(key.toLowerCase())))
      fail("Credentials must not be passed to the note importer");
    Object.values(value).forEach(rejectCredentials);
  }
};

const text = (value: Json | undefined, field: string, optional = false): string | null => {
  if ((value === null || value === undefined) && optional) return null;
  return typeof value === "string"
    ? value
    : fail(`${field} must be a string${optional ? " or null" : ""}`);
};

const DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const ISO =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:[.,](\d{1,9}))?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const pad = (value: number, size = 2): string => String(value).padStart(size, "0");

const validDate = (year: number, month: number, day: number): boolean => {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const days = month === 2 && !leap ? 28 : (DAYS[month - 1] ?? 0);
  return year >= 1 && day >= 1 && day <= days;
};

const validTime = (hour: string, minute: string, second: string): boolean =>
  Number(hour) < 24 && Number(minute) < 60 && Number(second) < 60;

const offset = (zone: string): string | null => {
  if (zone === "Z") return "+00:00";
  const digits = zone.slice(1).replace(":", "");
  const hours = Number(digits.slice(0, 2));
  const minutes = Number(digits.slice(2));
  return hours < 24 && minutes < 60 ? `${zone.slice(0, 1)}${pad(hours)}:${pad(minutes)}` : null;
};

/** Like Python's `fromisoformat(...).isoformat()`, except that a time zone is required. */
export const timestamp = (value: Json | undefined, field: string): string | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return fail(`${field} must be an ISO timestamp or null`);
  const invalid = `${field} is not a valid ISO timestamp`;
  const match = ISO.exec(value) ?? fail(invalid);
  const [, y = "", mo = "", d = "", h = "00", mi = "00", s = "00", fraction = "", zone] = match;
  if (!validDate(Number(y), Number(mo), Number(d)) || !validTime(h, mi, s)) return fail(invalid);
  if (zone === undefined) return fail(`${field} needs an explicit time zone`);
  const zoneText = offset(zone) ?? fail(invalid);
  const micros = Number(fraction.padEnd(6, "0").slice(0, 6));
  const tail = micros === 0 ? "" : `.${pad(micros, 6)}`;
  return `${y}-${mo}-${d}T${h}:${mi}:${s}${tail}${zoneText}`;
};

export const accountId = (value: Json | undefined): string => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/u.test(trimmed))
    fail("account_id must identify the confirmed mailbox address");
  return trimmed.toLowerCase();
};

const messageId = (value: Json | undefined): string => {
  const id = text(value, "gmail_message_id") ?? "";
  // oxlint-disable-next-line no-control-regex -- control characters are exactly what is rejected
  const unsafe = /[\u0000-\u001f]/.test(id);
  if (!id || [...id].length > 512 || unsafe) fail("Invalid gmail_message_id");
  return id;
};

const body = (message: JsonObject): JsonObject => {
  const status = message["body_status"];
  if (typeof status !== "string" || !BODY_STATUSES.has(status))
    return fail("body_status must be complete, partial or unavailable");
  const bodyText = text(message["body_text"], "body_text", status === "unavailable");
  if (status === "unavailable" && bodyText !== null) fail("Unavailable body must be null");
  const format = "body_format" in message ? message["body_format"] : "plain";
  if (typeof format !== "string" || !BODY_FORMATS.has(format)) fail("Unsupported body_format");
  return { body_text: bodyText, body_status: status, body_format: format ?? null };
};

const validSize = (size: Json | undefined): boolean =>
  size === null ||
  size === undefined ||
  (typeof size === "number" && Number.isInteger(size) && size >= 0);

const attachments = (value: Json | undefined): Json => {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value)) return fail("attachments must be a list or null");
  for (const item of value) {
    if (!isObject(item) || typeof item["filename"] !== "string")
      fail("Attachment metadata needs a filename");
    if (!validSize((item as JsonObject)["size"])) fail("Invalid attachment size");
  }
  return value;
};

const isStringList = (value: Json): boolean =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const recipients = (message: JsonObject): JsonObject => {
  const result: JsonObject = {};
  for (const field of ["to", "cc", "bcc"]) {
    const value = message[field] ?? null;
    if (value !== null && !isStringList(value)) fail(`${field} must be a list of strings or null`);
    result[field] = value;
  }
  return result;
};

const sourceUrl = (value: Json | undefined): Json => {
  if (value === null || value === undefined) return null;
  return typeof value === "string" && value.startsWith("https://mail.google.com/")
    ? value
    : fail("source_url must be a connector-provided Gmail HTTPS URL or null");
};

/** Validates one connector record and returns it with a fixed set of fields. */
export const normalize = (message: Json | undefined, account: string): JsonObject => {
  if (!isObject(message)) return fail("Each message must be an object");
  const id = messageId(message["gmail_message_id"]);
  const content = body(message);
  const files = attachments(message["attachments"]);
  return {
    account_id: account,
    gmail_message_id: id,
    gmail_thread_id: text(message["gmail_thread_id"], "gmail_thread_id", true),
    rfc_message_id: text(message["rfc_message_id"], "rfc_message_id", true),
    subject: text(message["subject"], "subject", true),
    from: text(message["from"], "from", true),
    ...recipients(message),
    received_at: timestamp(message["received_at"], "received_at"),
    sent_at: timestamp(message["sent_at"], "sent_at"),
    date_raw: text(message["date_raw"], "date_raw", true),
    ...content,
    attachments: files,
    source_url: sourceUrl(message["source_url"]),
    community_id: text(message["community_id"], "community_id", true),
  };
};

const sha256 = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

/** Stable note identity: `gmail-` plus SHA-256 of account, NUL and message id. */
export const noteId = (account: string, id: string): string =>
  `gmail-${sha256(`${account}\0${id}`)}`;

/** Hash of the source content; the community is a local classification and stays out. */
export const fingerprint = (data: JsonObject): string =>
  sha256(
    pyJson(
      Object.fromEntries(Object.entries(data).filter(([key]) => key !== "community_id")),
      true,
    ),
  );
