import { path2linkText } from "../utils";

export class FileEntity {
  public sourcePath: string;
  public linkText: string;

  constructor(path: string, linkText: string) {
    this.sourcePath = path;
    this.linkText = linkText;
  }

  static fromPath(path: string): FileEntity {
    const linkText = path2linkText(path);
    return new FileEntity(path, linkText);
  }

  key(): string {
    return this.sourcePath != null ? this.sourcePath : this.linkText;
  }

  static fromLink(link: string): FileEntity {
    return new FileEntity(null, link);
  }
}
