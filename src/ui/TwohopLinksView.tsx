import { TwohopLink } from "../model/TwohopLink";

import React from "react";
import { FileEntity } from "../model/FileEntity";
import LinkView from "./LinkView";

interface TwohopLinksViewProps {
  twoHopLinks: TwohopLink[];
  onClick: (fileEntity: FileEntity) => void;
  getPreview: (fileEntity: FileEntity) => Promise<string>;
}

export default class TwohopLinksView extends React.Component<TwohopLinksViewProps> {
  constructor(props: TwohopLinksViewProps) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        {this.props.twoHopLinks.map((link) => (
          <div className="twohop-links-section" key={link.link.sourcePath}>
            <div
              className={"twohop-links-twohop-header twohop-links-box"}
              onClick={() => this.props.onClick(link.link)}
            >
              {link.link.linkText}
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
