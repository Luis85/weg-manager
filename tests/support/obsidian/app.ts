import { MetadataCache, Vault } from "./vault";
import { Workspace } from "./workspace";

export class App {
  readonly workspace = new Workspace();
  readonly vault = new Vault();
  readonly metadataCache = new MetadataCache();
}
