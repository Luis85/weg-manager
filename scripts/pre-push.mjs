// @ts-check
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { FORMAT_STAGES, STAGES, runGate } from "./verify.mjs";
import { isCli } from "./is-cli.mjs";

/** @typedef {{ localRef: string; localSha: string; remoteRef: string; remoteSha: string }} PushLine */
/**
 * What the hook may ask git. Both answer `undefined` when they cannot (an object the clone does
 * not have, no default branch, no common ancestor).
 * @typedef {object} PushGit
 * @property {(tip: string) => string | undefined} mergeBase the commit where `tip` leaves the default branch
 * @property {(base: string, tip: string) => string[] | undefined} changedFiles paths that differ between two commits
 */
/** @typedef {{ mode: "full" | "format"; reason: string }} GateChoice */

/** A document is a file under `docs/` or a Markdown file anywhere. No gate step reads either. */
export const isDocumentPath = (/** @type {string} */ path) =>
  path.startsWith("docs/") || path.endsWith(".md");

const isZeroSha = (/** @type {string} */ sha) => /^0+$/.test(sha);

const OBJECT_ID = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/;

/**
 * @param {string} line
 * @returns {PushLine | undefined}
 */
const parsePushLine = (line) => {
  const [localRef, localSha, remoteRef, remoteSha, ...extra] = line.split(/\s+/);
  if (extra.length > 0 || localRef === undefined || remoteRef === undefined) return undefined;
  if (localSha === undefined || remoteSha === undefined) return undefined;
  if (!OBJECT_ID.test(localSha) || !OBJECT_ID.test(remoteSha)) return undefined;
  return { localRef, localSha, remoteRef, remoteSha };
};

/**
 * git's pre-push hook gets `<local ref> <local sha> <remote ref> <remote sha>` per ref on stdin.
 * @param {string} stdin
 * @returns {PushLine[] | undefined} `undefined` when a line is not of that shape
 */
export const parsePushLines = (stdin) => {
  const parsed = stdin
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map(parsePushLine);
  return parsed.includes(undefined) ? undefined : /** @type {PushLine[]} */ (parsed);
};

const FULL = (/** @type {string} */ reason) => ({ mode: /** @type {const} */ ("full"), reason });

/**
 * How much of the gate a push needs. Only a push whose changes are all documents runs just
 * `format:check`; anything else, and anything that cannot be worked out, runs the whole gate.
 *
 * Per pushed ref the changes are the difference between the tree the remote has and the tree that
 * is pushed. A ref the remote does not have yet (a new branch, a new tag) is compared with the
 * point where it leaves the default branch. A deleted ref pushes nothing. A tag is treated like
 * a branch: it is "documents only" only when its own commits are; a tag on a commit the default
 * branch already has adds no change.
 * @param {PushLine[] | undefined} pushes
 * @param {PushGit} git
 * @returns {GateChoice}
 */
export const chooseGate = (pushes, git) => {
  if (pushes === undefined || pushes.length === 0) return FULL("cannot read what is pushed");
  /** @type {string[]} */
  const files = [];
  for (const push of pushes) {
    if (isZeroSha(push.localSha)) continue;
    const base = isZeroSha(push.remoteSha) ? git.mergeBase(push.localSha) : push.remoteSha;
    if (base === undefined) return FULL(`no base for ${push.localRef}`);
    const changed = git.changedFiles(base, push.localSha);
    if (changed === undefined) return FULL(`cannot compare ${push.localRef}`);
    files.push(...changed);
  }
  const other = files.find((path) => !isDocumentPath(path));
  if (other !== undefined) return FULL(`${other} is not a document`);
  return { mode: "format", reason: `${files.length} changed file(s), all documents` };
};

/**
 * @param {string[]} args
 * @param {string | undefined} cwd
 */
const git = (args, cwd) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

/**
 * The default branch of `remote`: what `<remote>/HEAD` points at, else `main`, else `master`.
 * @param {string} remote
 * @param {string | undefined} cwd
 * @returns {string | undefined}
 */
const defaultBranch = (remote, cwd) => {
  for (const name of ["HEAD", "main", "master"]) {
    try {
      return git(
        ["rev-parse", "--verify", "--quiet", `refs/remotes/${remote}/${name}^{commit}`],
        cwd,
      ).trim();
    } catch {
      // not there; try the next one
    }
  }
  return undefined;
};

/**
 * @param {string} remote
 * @param {string} [cwd] the repository; the current directory by default
 * @returns {PushGit}
 */
export const realGit = (remote, cwd) => ({
  mergeBase: (tip) => {
    const branch = defaultBranch(remote, cwd);
    if (branch === undefined) return undefined;
    try {
      return git(["merge-base", branch, `${tip}^{commit}`], cwd).trim();
    } catch {
      return undefined;
    }
  },
  changedFiles: (base, tip) => {
    try {
      // --no-renames lists both sides of a move, so a file moved into docs/ is not hidden.
      const out = git(
        ["diff", "--name-only", "--no-renames", "-z", `${base}^{commit}`, `${tip}^{commit}`],
        cwd,
      );
      return out.split("\0").filter((path) => path !== "");
    } catch {
      return undefined;
    }
  },
});

if (isCli(import.meta.url)) {
  const remote = process.argv[2] ?? "origin";
  const choice = chooseGate(parsePushLines(readFileSync(0, "utf8")), realGit(remote));
  console.log(
    `pre-push: ${choice.mode === "format" ? "documents only, format:check" : "full gate"} (${choice.reason})`,
  );
  process.exitCode = await runGate(choice.mode === "format" ? FORMAT_STAGES : STAGES);
}
