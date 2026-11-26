import { openRoute, settle, type ScreenOptions } from "../communities/screen";

export { closeAll as closeContacts } from "../communities/screen";

/** Chooses `value` in a native select and lets the screen settle. */
const choose = async (element: Element | undefined, value: string) => {
  if (!(element instanceof HTMLSelectElement)) throw new Error("no select");
  element.value = value;
  element.dispatchEvent(new Event("change"));
  await settle();
};

/**
 * The app on the contacts screen (route `contacts`, `openRoute`), with a handle to choose in a
 * native select and the names of the listed contacts.
 */
export const openContacts = async (options: ScreenOptions = {}) => {
  const screen = await openRoute({ name: "contacts" }, "contacts-screen", options);
  const names = () => screen.all("contact-name").map((element) => element.textContent.trim());
  return { ...screen, choose, names };
};

export type ContactsScreen = Awaited<ReturnType<typeof openContacts>>;
