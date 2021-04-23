import {path2title} from "../utils";

export class FileEntity {
  public path: string;
  public title: string;

  constructor(path: string, title: string) {
    this.path = path;
    this.title = title;
  }

  static fromPath(path: string): FileEntity {
    const title = path2title(path)
    return new FileEntity(path, title)
  }
}