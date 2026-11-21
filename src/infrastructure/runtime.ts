import { ManagedRuntime, type Layer } from "effect";
import type { AppRuntime, AppServices } from "../application/app-services";

/** One runtime per plugin load; `dispose()` releases every service. */
export const makeRuntime = (layer: Layer.Layer<AppServices>): AppRuntime =>
  ManagedRuntime.make(layer);
