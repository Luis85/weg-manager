import { crc32 } from "node:zlib";

/** One file in the archive. */
export interface ZipEntry {
  readonly name: string;
  readonly data: Buffer;
}

// Fixed timestamp 2026-11-15 00:00:00 in MS-DOS format, so the bytes never depend on build time.
const DOS_DATE = ((2026 - 1980) << 9) | (11 << 5) | 15;
const DOS_TIME = 0;
const VERSION_NEEDED = 20;
const MADE_BY_UNIX = (3 << 8) | VERSION_NEEDED;
const REGULAR_FILE_0644 = (0o100644 << 16) >>> 0;
const UTF8_NAMES = 0x800;

const header = (size: number, write: (buffer: Buffer) => void): Buffer => {
  const buffer = Buffer.alloc(size);
  write(buffer);
  return buffer;
};

/**
 * Writes an uncompressed ("stored") ZIP. Deflate output differs between zlib builds, so a
 * compressed archive, and the checksum in `skills/manifest.json`, would depend on the machine
 * that built it. Entries keep the given order.
 */
export const storedZip = (entries: readonly ZipEntry[]): Buffer => {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, "utf8");
    const flags = nameBytes.length === name.length ? 0 : UTF8_NAMES;
    const crc = crc32(data);
    const local = header(30, (b) => {
      b.writeUInt32LE(0x04034b50, 0);
      b.writeUInt16LE(VERSION_NEEDED, 4);
      b.writeUInt16LE(flags, 6);
      b.writeUInt16LE(0, 8);
      b.writeUInt16LE(DOS_TIME, 10);
      b.writeUInt16LE(DOS_DATE, 12);
      b.writeUInt32LE(crc, 14);
      b.writeUInt32LE(data.length, 18);
      b.writeUInt32LE(data.length, 22);
      b.writeUInt16LE(nameBytes.length, 26);
      b.writeUInt16LE(0, 28);
    });
    const central = header(46, (b) => {
      b.writeUInt32LE(0x02014b50, 0);
      b.writeUInt16LE(MADE_BY_UNIX, 4);
      b.writeUInt16LE(VERSION_NEEDED, 6);
      b.writeUInt16LE(flags, 8);
      b.writeUInt16LE(0, 10);
      b.writeUInt16LE(DOS_TIME, 12);
      b.writeUInt16LE(DOS_DATE, 14);
      b.writeUInt32LE(crc, 16);
      b.writeUInt32LE(data.length, 20);
      b.writeUInt32LE(data.length, 24);
      b.writeUInt16LE(nameBytes.length, 28);
      b.writeUInt32LE(REGULAR_FILE_0644, 38);
      b.writeUInt32LE(offset, 42);
    });
    locals.push(local, nameBytes, data);
    centrals.push(central, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }
  const directory = Buffer.concat(centrals);
  const end = header(22, (b) => {
    b.writeUInt32LE(0x06054b50, 0);
    b.writeUInt16LE(entries.length, 8);
    b.writeUInt16LE(entries.length, 10);
    b.writeUInt32LE(directory.length, 12);
    b.writeUInt32LE(offset, 16);
  });
  return Buffer.concat([...locals, directory, end]);
};

/** Names and contents of a stored ZIP written by {@link storedZip}; for tests and checks. */
export const readStoredZip = (archive: Buffer): ZipEntry[] => {
  const entries: ZipEntry[] = [];
  let position = 0;
  while (archive.readUInt32LE(position) === 0x04034b50) {
    const size = archive.readUInt32LE(position + 18);
    const nameLength = archive.readUInt16LE(position + 26);
    const extra = archive.readUInt16LE(position + 28);
    const start = position + 30;
    const name = archive.subarray(start, start + nameLength).toString("utf8");
    const dataStart = start + nameLength + extra;
    entries.push({ name, data: archive.subarray(dataStart, dataStart + size) });
    position = dataStart + size;
  }
  return entries;
};
