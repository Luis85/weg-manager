import { openRoute, settle, type Memory } from "../communities/screen";
import { AW, FOLDER, communityNote, contactNote } from "./fixture";

export { closeAll } from "../communities/screen";

/** The id of the Tiefgarage (TG), the second community of `vault`. */
export const TG = "community-00000000-0000-4000-8000-000000000066";

/** Ahornweg (AW), Tiefgarage (TG), the manager and `matters` (path in Vorgänge, frontmatter, body). */
export const vault =
  (...matters: [string, Record<string, unknown>, string?][]) =>
  (notes: Memory) => {
    notes.seed(
      "WEG Manager/Gemeinschaften/Ahornweg.md",
      communityNote(101, { name: "Ahornweg", short_code: "AW" }),
    );
    notes.seed(
      "WEG Manager/Gemeinschaften/Tiefgarage.md",
      communityNote(102, { id: TG, name: "Tiefgarage", short_code: "TG", color: "blue" }),
    );
    notes.seed(
      "WEG Manager/Kontakte/Verwaltung.md",
      contactNote(201, AW, { name: "Verwaltung", kind: "company", roles: [`${AW}:manager`] }),
    );
    for (const [path, frontmatter, body] of matters)
      notes.seed(`${FOLDER}/${path}`, frontmatter, body ?? "");
  };

/** Chooses `value` in a native select and lets the screen settle. */
export const choose = async (element: Element | undefined, value: string) => {
  if (!(element instanceof HTMLSelectElement)) throw new Error("no select");
  element.value = value;
  element.dispatchEvent(new Event("change"));
  await settle();
};

/** The app on the matters screen on 2026-11-26, with the names of the listed matters. */
export const openMatters = async (seed: (notes: Memory) => void) => {
  const screen = await openRoute({ name: "matters" }, "matters-screen", {
    seed,
    today: "2026-11-26",
  });
  const names = () => screen.all("matter-name").map((element) => element.textContent.trim());
  return { ...screen, names };
};
