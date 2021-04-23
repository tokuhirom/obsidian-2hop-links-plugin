import {FileEntity} from "./FileEntity";

export class TwoHopLink {
  public link: string;
  public fileEntities: FileEntity[];

  constructor(link: string, fileEntities: FileEntity[]) {
    this.link = link
    this.fileEntities = fileEntities
  }
}
