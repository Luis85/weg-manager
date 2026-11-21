import { ManagedRuntime } from "effect";
import { languageFromCode } from "../src/application/i18n";
import type { UserMessage } from "../src/application/user-messages";
import { mountSurface } from "../src/presentation/mount";
import "../src/styles/app.css";
import "./fake-host.css";
import { SCENARIOS, harnessLayer, parseScenario } from "./layers";

/** Two surfaces on one runtime, like two open views, with a theme switch and visible notices. */
const params = new URLSearchParams(window.location.search);
const scenario = parseScenario(params.get("scenario"));
/** `?lang=en` shows the English texts; anything else that is not German too. */
const language = languageFromCode(params.get("lang") ?? "de");
const element = (id: string): HTMLElement => {
  const found = document.getElementById(id);
  if (found === null) throw new Error(`harness: #${id} missing`);
  return found;
};

const notices = element("notices");
const notify = (message: UserMessage): void => {
  const item = document.createElement("li");
  const title = document.createElement("strong");
  title.textContent = message.title;
  item.append(title, document.createElement("br"), message.detail);
  notices.prepend(item);
  window.setTimeout(() => item.remove(), 6000);
};

const runtime = ManagedRuntime.make(
  harnessLayer(scenario, {
    notify,
    writeClipboard: (text) => navigator.clipboard.writeText(text),
    language,
  }),
);
mountSurface(element("surface-wide"), runtime);
mountSurface(element("surface-narrow"), runtime);

const select = element("scenario") as HTMLSelectElement;
for (const name of SCENARIOS) select.add(new Option(name, name, false, name === scenario));
select.addEventListener("change", () => {
  params.set("scenario", select.value);
  window.location.search = params.toString();
});

element("theme").addEventListener("click", () => {
  const dark = document.body.classList.contains("theme-dark");
  document.body.classList.toggle("theme-dark", !dark);
  document.body.classList.toggle("theme-light", dark);
});
