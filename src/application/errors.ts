import type { CommunitiesError } from "./communities";
import type { NotesError } from "./notes";
import type { ShellError } from "./shell";

/**
 * Every expected failure: the union of the modules' error unions (ADR 0006). Each member needs a
 * text: `describeError` (`user-messages.ts`) does not compile until its module's describer takes it.
 */
export type AppError = ShellError | NotesError | CommunitiesError;
