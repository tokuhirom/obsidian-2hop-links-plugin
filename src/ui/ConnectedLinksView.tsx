import React from "react";
import { FileEntity } from "../model/FileEntity";
import LinkView from "./LinkView";

interface ConnectedLinksViewProps {
  fileEntities: FileEntity[];
  onClick: (fileEntity: FileEntity) => Promise<void>;
  getPreview: (fileEntity: FileEntity) => Promise<string>;
  boxWidth: string;
  boxHeight: string;
  title: string;
  className: string;
}

export default class ConnectedLinksView extends React.Component<ConnectedLinksViewProps> {
  constructor(props: ConnectedLinksViewProps) {
    super(props);
  }

  render(): JSX.Element {
    if (this.props.fileEntities.length > 0) {
      return (
        <div className={"twohop-links-section " + this.props.className}>
          <div
            className={"twohop-links-box twohop-links-connected-links-header"}
            style={{
              width: this.props.boxWidth,
              height: this.props.boxHeight,
            }}
          >
            {this.props.title}
          </div>
          {this.props.fileEntities.map((it) => {
            return (
              <LinkView
                fileEntity={it}
                key={it.key()}
                onClick={this.props.onClick}
                getPreview={this.props.getPreview}
                boxWidth={this.props.boxWidth}
                boxHeight={this.props.boxHeight}
              />
            );
          })}
        </div>
      );
    } else {
      return <div />;
    }
  }
}
