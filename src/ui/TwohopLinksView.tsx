import { TwohopLink } from "../model/TwohopLink";

import React from "react";
import { FileEntity } from "../model/FileEntity";
import LinkView from "./LinkView";

interface TwohopLinksViewProps {
  twoHopLinks: TwohopLink[];
  resolved: boolean;
  onClick: (fileEntity: FileEntity) => Promise<void>;
  getPreview: (fileEntity: FileEntity) => Promise<string>;
  boxWidth: string;
  boxHeight: string;
}

export default class TwohopLinksView extends React.Component<TwohopLinksViewProps> {
  constructor(props: TwohopLinksViewProps) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        {this.props.twoHopLinks.map((link) => (
          <div
            className={
              "twohop-links-section " +
              (this.props.resolved
                ? "twohop-links-resolved"
                : "twohop-links-unresolved")
            }
            key={link.link.linkText}
          >
            <div
              className={"twohop-links-twohop-header twohop-links-box"}
              onClick={async () => this.props.onClick(link.link)}
              onMouseDown={async (event) =>
                event.button == 0 && this.props.onClick(link.link)
              }
              style={{
                width: this.props.boxWidth,
                height: this.props.boxHeight,
              }}
            >
              {link.link.linkText.replace(/\.md$/, "")}
            </div>
            {link.fileEntities.map((it) => (
              <LinkView
                fileEntity={it}
                key={link.link.linkText + it.key()}
                onClick={this.props.onClick}
                getPreview={this.props.getPreview}
                boxWidth={this.props.boxWidth}
                boxHeight={this.props.boxHeight}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
}
