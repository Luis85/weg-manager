/**
 * Builds the distributable Claude skill; installs and connects nothing.
 *
 * `npm run skills:package` bundles the TypeScript writer into
 * `weg-gmail-to-vault/scripts/import-messages.mjs`, writes the stored ZIP to
 * `skills/dist/` and refreshes `skills/manifest.json`.
 */
import { createHash } from "node:crypto";
import { lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build, type Rolldown } from "vite";
import { storedZip, type ZipEntry } from "./zip.ts";

export const SKILL_NAME = "weg-gmail-to-vault";
export const VERSION = "0.2.0";
export const WRITER = "scripts/import-messages.mjs";
const RESOURCES = [
  "LICENSE",
  "SKILL.md",
  "references/email-note-schema.md",
  "references/runtime-and-installation.md",
];
const HEADER = `#!/usr/bin/env node
// Generated from skills/src/gmail/*.ts by \`npm run skills:package\`; do not edit.
// Needs Node.js 20 or newer and nothing else.
`;

export interface SkillManifest {
  readonly schema: string;
  readonly skills: readonly Record<string, unknown>[];
}

const sha256 = (data: Buffer): string => createHash("sha256").update(data).digest("hex");

/** Bundles the writer and its modules into one dependency-free ES module. */
export const bundleWriter = async (repo: string): Promise<string> => {
  const result = await build({
    configFile: false,
    root: repo,
    logLevel: "silent",
    build: {
      ssr: join(repo, "skills/src/gmail/cli.ts"),
      target: "node20",
      minify: false,
      write: false,
      rolldownOptions: { output: { format: "es", entryFileNames: "import-messages.mjs" } },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]) as Rolldown.RolldownOutput[];
  const chunk = outputs.flatMap((output) => output.output).find((item) => item.type === "chunk");
  if (chunk?.type !== "chunk") throw new Error("Bundling the Gmail writer produced no chunk");
  return HEADER + chunk.code;
};

const resource = (source: string, name: string): Buffer => {
  const path = join(source, name);
  const safe = lstatSync(path, { throwIfNoEntry: false });
  const inSkill = safe?.isFile() === true && realpathSync(path).startsWith(`${source}/`);
  if (!inSkill) throw new Error(`Missing or unsafe skill resource: ${name}`);
  return readFileSync(path);
};

const manifestFor = (archive: string, data: Buffer): SkillManifest => ({
  schema: "weg-manager.skill-packages/v1",
  skills: [
    {
      id: SKILL_NAME,
      version: VERSION,
      title: "Gmail-Nachrichten in den WEG-Vault übernehmen",
      source: `${SKILL_NAME}/`,
      entrypoint: "SKILL.md",
      archive,
      sha256: sha256(data),
      size_bytes: data.length,
      license: "MIT",
      capabilities_required: [
        "existing-gmail-search-and-read-connector",
        "user-granted-vault-write-access",
        "node-20-or-newer",
      ],
      mailbox_access: "read-only-workflow",
      installation_modes: [
        {
          mode: "claude-code-project-folder",
          destination: `.claude/skills/${SKILL_NAME}`,
          behavior: "user-selected project or vault; existing files must be compared before update",
        },
        {
          mode: "claude-custom-skill-upload",
          artifact: "zip-with-single-skill-root",
          behavior: "provide archive to user; no universal account-side installation API assumed",
        },
      ],
      plugin_installer_status: "specified-not-implemented",
      live_claude_gmail_validation: "not-performed",
    },
  ],
});

/** Writes the ZIP to `<output>/dist/` and the manifest to `<output>/manifest.json`. */
export const buildPackage = (repo: string, output: string, writer: string): SkillManifest => {
  const source = realpathSync(join(repo, "skills", SKILL_NAME));
  const files: ZipEntry[] = [
    ...RESOURCES.map((name) => ({ name, data: resource(source, name) })),
    { name: WRITER, data: Buffer.from(writer, "utf8") },
  ]
    .toSorted((a, b) => (a.name < b.name ? -1 : 1))
    .map(({ name, data }) => ({ name: `${SKILL_NAME}/${name}`, data }));
  const archive = storedZip(files);
  const archivePath = join(output, "dist", `${SKILL_NAME}-${VERSION}.zip`);
  mkdirSync(join(output, "dist"), { recursive: true });
  writeFileSync(archivePath, archive);
  const manifest = manifestFor(relative(output, archivePath).split("\\").join("/"), archive);
  writeFileSync(join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
};

const main = async (): Promise<void> => {
  const repo = resolve(fileURLToPath(new URL("../..", import.meta.url)));
  const writer = await bundleWriter(repo);
  writeFileSync(join(repo, "skills", SKILL_NAME, WRITER), writer, { mode: 0o755 });
  const manifest = buildPackage(repo, join(repo, "skills"), writer);
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
};

const script = process.argv[1];
if (script !== undefined && import.meta.url === pathToFileURL(realpathSync(script)).href)
  await main();
