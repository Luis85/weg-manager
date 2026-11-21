const HOST_CLASSES = { "theme-dark": "dark", "theme-light": "light" } as const;

/**
 * Mirrors the host theme (`theme-dark` / `theme-light` on the owner document's body) to `dark` /
 * `light` on `root`, so Nuxt UI follows a theme switch without a remount. Observes the body of
 * `root`'s own document, which is the pop-out window's when the view lives there. Release
 * disconnects and restores the classes `root` had before.
 */
export const bindHostTheme = (root: HTMLElement): (() => void) => {
  const doc = root.ownerDocument;
  const body = doc.body;
  const original = {
    dark: root.classList.contains("dark"),
    light: root.classList.contains("light"),
  };
  const sync = () => {
    const dark = body.classList.contains("theme-dark");
    const light = !dark && body.classList.contains("theme-light");
    root.classList.toggle(HOST_CLASSES["theme-dark"], dark);
    root.classList.toggle(HOST_CLASSES["theme-light"], light);
  };
  const View = doc.defaultView?.MutationObserver ?? MutationObserver;
  const observer = new View(sync);
  observer.observe(body, { attributes: true, attributeFilter: ["class"] });
  sync();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    observer.disconnect();
    root.classList.toggle("dark", original.dark);
    root.classList.toggle("light", original.light);
  };
};
