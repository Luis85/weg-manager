import { FileManager } from "./file-manager";
import { MetadataCache } from "./metadata-cache";
import { Vault } from "./vault";
import { Workspace } from "./workspace";

export class App {
  readonly workspace = new Workspace();
  readonly vault = new Vault();
  readonly metadataCache = new MetadataCache(this.vault);
  readonly fileManager = new FileManager(this.vault, this.metadataCache);
}
