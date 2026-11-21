import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { asciiJson, pyJson, textOf, toAscii } from "./json.ts";
import { BAD_STATUSES, DEFAULT_DESTINATION, importMessages } from "./import.ts";
import { ImportInputError } from "./normalize.ts";

const USAGE = `usage: import-messages.mjs [-h] --input INPUT --vault VAULT [--destination DESTINATION] [--apply]

Import normalized Gmail connector data into portable notes. No network calls.

options:
  -h, --help            show this help message and exit
  --input INPUT
  --vault VAULT
  --destination DESTINATION
  --apply               Create new notes; default is read-only preview
`;

interface Arguments {
  input?: string;
  vault?: string;
  destination: string;
  apply: boolean;
  help: boolean;
}

const VALUE_FLAGS = new Map([
  ["--input", "input"],
  ["--vault", "vault"],
  ["--destination", "destination"],
] as const);
const SWITCHES = new Map([
  ["-h", "help"],
  ["--help", "help"],
  ["--apply", "apply"],
] as const);

/** Reads the argument at `index` into `result`; returns the next index or an error text. */
const readArgument = (
  argv: readonly string[],
  index: number,
  result: Arguments,
): number | string => {
  const argument = argv[index] ?? "";
  const [flag = "", inline] = argument.split(/=(.*)/s, 2);
  const toggle = SWITCHES.get(flag as "--apply");
  if (toggle && inline === undefined) {
    result[toggle] = true;
    return index + 1;
  }
  const key = VALUE_FLAGS.get(flag as "--input");
  if (!key) return `unrecognized arguments: ${argument}`;
  const value = inline ?? argv[index + 1];
  if (value === undefined) return `argument ${flag}: expected one argument`;
  result[key] = value;
  return inline === undefined ? index + 2 : index + 1;
};

/** Parses `--name value`, `--name=value`, `--apply` and `-h`; returns an error text otherwise. */
export const parseArguments = (argv: readonly string[]): Arguments | string => {
  const result: Arguments = { destination: DEFAULT_DESTINATION, apply: false, help: false };
  for (let index = 0; index < argv.length;) {
    const next = readArgument(argv, index, result);
    if (typeof next === "string") return next;
    index = next;
  }
  const names = [
    result.input === undefined ? "--input" : "",
    result.vault === undefined ? "--vault" : "",
  ].filter(Boolean);
  return result.help || names.length === 0
    ? result
    : `the following arguments are required: ${names.join(", ")}`;
};

const expected = (error: unknown): error is Error =>
  error instanceof ImportInputError ||
  error instanceof SyntaxError ||
  (error instanceof Error && "code" in error);

/** Runs the writer like the command line does; returns the exit code. */
export const run = (
  argv: readonly string[],
  write: (text: string) => void,
  writeError: (text: string) => void,
): number => {
  const args = parseArguments(argv);
  if (typeof args === "string") {
    writeError(`${USAGE.split("\n\n")[0] ?? ""}\nimport-messages.mjs: error: ${args}\n`);
    return 2;
  }
  if (args.help) {
    write(USAGE);
    return 0;
  }
  try {
    const raw = readFileSync(args.input ?? "", "utf8").replace(/^\uFEFF/, "");
    const options = { destination: args.destination, apply: args.apply };
    const report = importMessages(JSON.parse(raw), args.vault ?? "", options);
    write(`${asciiJson(report)}\n`);
    return report.results.some((row) => BAD_STATUSES.has(textOf(row["status"]))) ? 2 : 0;
  } catch (error) {
    if (!expected(error)) throw error;
    write(`${toAscii(pyJson({ error: error.message }))}\n`);
    return 2;
  }
};

const invokedDirectly = (): boolean => {
  const script = process.argv[1];
  return script !== undefined && import.meta.url === pathToFileURL(realpathSync(script)).href;
};

if (invokedDirectly()) {
  process.exitCode = run(
    process.argv.slice(2),
    (text) => process.stdout.write(text),
    (text) => process.stderr.write(text),
  );
}
