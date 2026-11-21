export type TFile = {
  readonly path: string;
  readonly basename: string;
  readonly extension: string;
};

export class Vault {
  files: TFile[] = [];
  failReads = false;

  getMarkdownFiles(): TFile[] {
    if (this.failReads) throw new Error("vault read failed");
    return this.files.filter((file) => file.extension === "md");
  }

  /** Test helper. */
  setMarkdownFileCount(count: number): void {
    this.files = Array.from({ length: count }, (_, index) => ({
      path: `note-${index}.md`,
      basename: `note-${index}`,
      extension: "md",
    }));
  }
}
