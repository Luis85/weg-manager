import { TEXT_MAX_LENGTH, TOPIC_MAX_LENGTH } from "../../../domain/matters";

/** The longest source (DV-03). */
const SOURCE_MAX_LENGTH = 100;

/**
 * The sentences of the one-line text issues, in the words of `oneLine` (each language has its
 * own): the same fields and limits in every catalog.
 */
export const lineIssues = (oneLine: (label: string, max: number) => string) => ({
  "topic.invalid": (_: unknown, label: string) => oneLine(label, TOPIC_MAX_LENGTH),
  "outcome.invalid": (_: unknown, label: string) => oneLine(label, TEXT_MAX_LENGTH),
  "source.invalid": (_: unknown, label: string) => oneLine(label, SOURCE_MAX_LENGTH),
  "next-step.invalid": (_: unknown, label: string) => oneLine(label, TEXT_MAX_LENGTH),
  "message-ref.invalid": (_: unknown, label: string) => oneLine(label, TEXT_MAX_LENGTH),
  "link.invalid": (_: unknown, label: string) => oneLine(label, TEXT_MAX_LENGTH),
});
