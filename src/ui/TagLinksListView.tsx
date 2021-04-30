import { TwohopLink } from "../model/TwohopLink";

import React from "react";
import { FileEntity } from "../model/FileEntity";
import LinkView from "./LinkView";
import {TagLinks} from "../model/TagLinks";

interface TagLinksListViewProps {
  tagLinksList: TagLinks[];
  onClick: (fileEntity: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

export default class TagLinksListView extends React.Component<TagLinksListViewProps> {
  constructor(props: TagLinksListViewProps) {
    super(props);
  }

  render(): JSX.Element {
    return (
        <div>
          {this.props.tagLinksList.map((link) => (
              <div className="twohop-links-section" key={link.tag}>
                <div className={"twohop-links-twohop-header twohop-links-box"}>
                  {link.tag}
                </div>
                {link.fileEntities.map((it) => (
                    <LinkView
                        fileEntity={it}
                        key={it.key()}
                        onClick={this.props.onClick}
                        getPreview={this.props.getPreview}
                    />
                ))}
              </div>
          ))}
        </div>
    );
  }
}
