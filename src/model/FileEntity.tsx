export class FileEntity {
  public sourcePath: string;
  public linkText: string;

  constructor(sourcePath: string, linkText: string) {
    if (linkText == null) {
      throw new Error("linkText should not be null");
    }
    this.sourcePath = sourcePath;
    this.linkText = linkText;
  }

  key(): string {
    return this.linkText;
  }
}
