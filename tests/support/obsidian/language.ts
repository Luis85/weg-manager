/**
 * Obsidian's app language (`getLanguage()`). The double starts in German, the product's primary
 * language, so the exact German texts of the dom tests stay meaningful. A suite that switches to
 * another language with `setLanguage` sets it back in `afterEach`.
 */
export const DEFAULT_TEST_LANGUAGE = "de";

let language = DEFAULT_TEST_LANGUAGE;

export const getLanguage = (): string => language;

export const setLanguage = (code: string): void => {
  language = code;
};
