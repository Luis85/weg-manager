/**
 * The vault-scoped local storage behind `App.loadLocalStorage`/`saveLocalStorage`, as Obsidian
 * 1.15.1 implements it: values are stored as JSON, a falsy value clears the key, and neither call
 * throws (a broken entry reads as `null`).
 */
export class VaultLocalStorage {
  private readonly entries = new Map<string, string>();

  load(key: string): unknown {
    const raw = this.entries.get(key);
    if (raw === undefined || raw === "") return null;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  save(key: string, data: unknown): void {
    if (data) this.entries.set(key, JSON.stringify(data));
    else this.entries.delete(key);
  }

  /** Test helper: puts a raw string in place, e.g. broken JSON. */
  setRaw(key: string, raw: string): void {
    this.entries.set(key, raw);
  }
}
