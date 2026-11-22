import type * as Obsidian from "obsidian";
import type { Uses } from "./conformance";
import { FileManager } from "./file-manager";
import { VaultLocalStorage } from "./local-storage";
import { MetadataCache } from "./metadata-cache";
import { Vault } from "./vault";
import { Workspace } from "./workspace";

export class App implements Uses<
  Obsidian.App,
  "vault" | "workspace" | "metadataCache" | "fileManager" | "loadLocalStorage" | "saveLocalStorage"
> {
  readonly workspace = new Workspace(this);
  readonly vault = new Vault();
  readonly metadataCache = new MetadataCache(this.vault);
  readonly fileManager = new FileManager(this.vault, this.metadataCache);
  /** Test handle on what `loadLocalStorage`/`saveLocalStorage` keep. */
  readonly localStorage = new VaultLocalStorage();

  loadLocalStorage(key: string): unknown {
    return this.localStorage.load(key);
  }

  saveLocalStorage(key: string, data: unknown): void {
    this.localStorage.save(key, data);
  }
}
