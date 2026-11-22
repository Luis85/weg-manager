import type { ManagedRuntime } from "effect";
import type { ServicesOf } from "./module";
import type { AppModule } from "./modules";
import type { NotesServices } from "./notes";
import type { ShellServices } from "./shell";

/**
 * Everything a use case may require: the services of the core modules, built from the host's
 * adapters, and those of the feature modules' manifests (ADR 0006). The runtime of one plugin load
 * provides all of it.
 */
export type AppServices = ShellServices | NotesServices | ServicesOf<AppModule>;

/** The runtime of one plugin load; presentation runs use cases through it. */
export type AppRuntime = ManagedRuntime.ManagedRuntime<AppServices, never>;
