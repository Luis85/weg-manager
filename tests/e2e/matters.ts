import { communityText, writeNote, type community } from "./communities";

/** The manager's contact id every matters spec uses. */
export const MANAGER = "contact-00000000-0000-4000-8000-0000000000c9";

const lines = (...parts: string[]) => [...parts, ""].join("\n");

/** Writes the community `aw` and the manager with its role there, as every matters spec starts. */
export const writeCommunityAndManager = async (aw: ReturnType<typeof community>) => {
  await writeNote("WEG Manager/Gemeinschaften/Ahornweg.md", communityText(aw));
  await writeNote(
    "WEG Manager/Kontakte/Verwaltung.md",
    lines(
      "---",
      "schema: weg-manager.contact/v1",
      `id: ${MANAGER}`,
      "name: Verwaltung",
      "kind: company",
      "roles:",
      `  - ${aw.id}:manager`,
      "---",
    ),
  );
};
