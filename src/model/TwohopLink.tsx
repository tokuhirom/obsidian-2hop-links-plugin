import { FileEntity } from "./FileEntity";

export class TwohopLink {
  public link: FileEntity;
  public fileEntities: FileEntity[];

  constructor(link: FileEntity, fileEntities: FileEntity[]) {
    this.link = link;
    this.fileEntities = fileEntities;
  }
}
