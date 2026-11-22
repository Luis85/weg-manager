import { describerOf } from "./module";
import { APP_MODULES } from "./modules";

/**
 * The text of any expected failure, in the UI language: each error goes to its module's describer
 * with that module's part of the catalog. Exhaustive by type: `AppError` is the union of the
 * describers' errors, and each manifest's tags name every member of its module's union.
 */
export const describeError = describerOf(APP_MODULES);
