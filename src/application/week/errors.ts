import { Schema } from "effect";

/**
 * The week note changed outside the plugin since the briefing text was loaded: nothing was
 * written, so the other edit is not lost. The user opens the briefing again and edits the text
 * as it is now.
 */
export class WeekChangedError extends Schema.TaggedError<WeekChangedError>()(
  "WeekChangedError",
  {},
) {}

/** Every expected failure of the week module. Each needs a text in its describer. */
export type WeekError = WeekChangedError;

/** One key per member of `WeekError`; typecheck fails while one is missing or extra. */
export const WEEK_ERROR_TAG_KEYS = {
  WeekChangedError: true,
} satisfies Record<WeekError["_tag"], true>;
