import { removeBlockReference } from "../utils";

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

  // Key to de-duplication.
  key(): string {
    return removeBlockReference(this.linkText);
  }
}
