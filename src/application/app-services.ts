import type { ManagedRuntime } from "effect";
import type { CommunitiesServices } from "./communities";
import type { NotesServices } from "./notes";
import type { ShellServices } from "./shell";

/**
 * Everything a use case may require: the union of the modules' services (ADR 0006). The runtime of
 * one plugin load provides all of it.
 */
export type AppServices = ShellServices | NotesServices | CommunitiesServices;

/** The runtime of one plugin load; presentation runs use cases through it. */
export type AppRuntime = ManagedRuntime.ManagedRuntime<AppServices, never>;
