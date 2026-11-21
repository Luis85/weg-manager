import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import {
  noteChanges,
  noteSnapshot,
  rebuildNoteIndex,
  type IndexStatus,
} from "../../../../src/application/notes";
import { describeError } from "../../../../src/application/user-messages";
import {
  ErrorNotice,
  useCommand,
  useMessages,
  useStream,
} from "../../../../src/presentation/shell";
import { runtimes } from "../../../support/composable";
import { FULL, testItem } from "../../../support/notes/test-note-type";
import { mountApp } from "../../../support/surface";

const { make, disposeAll } = runtimes();
const closes: (() => void)[] = [];

afterEach(async () => {
  for (const close of closes.splice(0)) close();
  document.body.replaceChildren();
  await disposeAll();
});

/**
 * How a feature's list follows the index: loading until it is ready, the notes, and the failure
 * beside the last notes with a retry that rebuilds. Test-only; no product view does this yet.
 */
const IndexedList = defineComponent({
  setup() {
    const snapshot = useStream(noteSnapshot(testItem), noteChanges(testItem));
    const rebuild = useCommand(() => rebuildNoteIndex);
    const messages = useMessages();
    const failure = (status: IndexStatus) =>
      status.failure === undefined
        ? []
        : [
            h(ErrorNotice, {
              message: describeError(status.failure, messages),
              handlers: { retry: () => rebuild.run() },
            }),
          ];
    return () =>
      h("div", [
        ...failure(snapshot.value),
        snapshot.value.ready
          ? h(
              "ul",
              snapshot.value.notes.map((note) => h("li", note.path)),
            )
          : h("p", "…"),
      ]);
  },
});

describe("a view that follows the note index", () => {
  it("shows the index's failure with a retry that rebuilds it", async () => {
    const test = make({ noteTypes: [testItem] });
    test.notes.seed("WEG Manager/A.md", FULL);
    test.notes.setFailReads(true);
    const root = document.createElement("div");
    document.body.append(root);
    closes.push(mountApp(root, test.runtime, { content: IndexedList }));
    await flushPromises();
    expect(root.textContent).toBe("…");
    await test.vaultReady();
    await vi.waitFor(() => {
      expect(root.querySelector("[role=alert]")?.textContent).toContain("Notizen nicht aktuell");
    });
    expect(root.textContent).toContain(
      "Obsidian konnte nicht alle Notizen lesen, deshalb zeigt die Liste vielleicht einen älteren Stand. Lies die Notizen erneut ein.",
    );
    test.notes.setFailReads(false);
    const retry = [...root.querySelectorAll("button")].find(
      (button) => button.textContent === "Erneut versuchen",
    );
    retry?.click();
    await vi.waitFor(() => {
      expect(root.querySelector("li")?.textContent).toBe("WEG Manager/A.md");
    });
    expect(root.querySelector("[role=alert]")).toBeNull();
  });
});
