import { FileEntity } from "./FileEntity";

export class TagLinks {
  public tag: string;
  public fileEntities: FileEntity[];

  constructor(tag: string, fileEntities: FileEntity[]) {
    this.tag = tag;
    this.fileEntities = fileEntities;
  }
}
