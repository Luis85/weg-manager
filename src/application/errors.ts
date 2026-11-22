import type { ErrorOf } from "./module";
import type { AppModule } from "./modules";

/**
 * Every expected failure: the union of the modules' error unions (ADR 0006), from their manifests.
 * Each member has a text: a module's manifest names each of its errors' tags and its describer.
 */
export type AppError = ErrorOf<AppModule>;
