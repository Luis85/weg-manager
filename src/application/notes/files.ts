import { Effect } from "effect";
import { MAX_NAME_ATTEMPTS, clashName } from "../../domain/notes";
import { NotePathTakenError, type InvalidNoteNameError } from "./index";
import { checkNoteName, clashesWith, vaultFolder, type FoldersIn, type SiblingsOf } from "./paths";

type Normalize = (path: string) => string;

/** `name` split before its last dot: `Angebot.pdf` is `Angebot` and `.pdf`, `README` has none. */
const splitExtension = (name: string): readonly [string, string] => {
  const dot = name.lastIndexOf(".");
  return dot <= 0 ? [name, ""] : [name.slice(0, dot), name.slice(dot)];
};

/**
 * Where a new file `name` (with its extension) goes in `folder` (ADR 0007, amendment 26.11.2026):
 * the folder in the vault's spelling (`vaultFolder`) and the first path that clashes with nothing
 * there, ` (2)`, ` (3)`, … before the extension. A file is never overwritten.
 */
export const planNewFile = (
  folder: string,
  name: string,
  normalize: Normalize,
  siblingsOf: SiblingsOf,
  foldersIn: FoldersIn,
): Effect.Effect<
  { readonly folder: string; readonly path: string },
  InvalidNoteNameError | NotePathTakenError
> =>
  Effect.gen(function* () {
    const [stem, extension] = splitExtension(name);
    yield* checkNoteName(stem);
    const found = normalize(vaultFolder(normalize(folder), foldersIn));
    const taken = clashesWith(siblingsOf(found));
    for (let attempt = 1; attempt <= MAX_NAME_ATTEMPTS; attempt += 1) {
      const path = normalize(`${found}/${clashName(stem, attempt)}${extension}`);
      if (!taken(path)) return { folder: found, path };
    }
    return yield* Effect.fail(new NotePathTakenError());
  });
