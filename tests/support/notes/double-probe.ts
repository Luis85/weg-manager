import type { App as ObsidianApp } from "obsidian";
import { asObsidian } from "../obsidian/real";
import type { App } from "../obsidian";
import { probeApi } from "./probe-api";
import { eventRecorder } from "./recorder";
import type { ScenarioProbe } from "./scenario-context";

/**
 * What the probe plugin gives a scenario in real Obsidian, built on the double: the real
 * `NoteStore` adapter and the event recorder on `app`. The context a scenario receives on the
 * double is `doubleContext(app)`.
 */
export const doubleProbe = (app: App): ScenarioProbe => {
  const real: ObsidianApp = asObsidian(app);
  return { api: probeApi(real), recorder: (options) => eventRecorder(real, options) };
};
