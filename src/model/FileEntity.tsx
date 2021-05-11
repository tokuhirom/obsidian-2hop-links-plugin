export class FileEntity {
  public sourcePath: string;
  public linkText: string;

  constructor(sourcePath: string, linkText: string) {
    this.sourcePath = sourcePath;
    this.linkText = linkText;
  }

  key(): string {
    return this.sourcePath != null ? this.sourcePath : this.linkText;
  }

  static fromLink(link: string): FileEntity {
    return new FileEntity(null, link);
  }
}
