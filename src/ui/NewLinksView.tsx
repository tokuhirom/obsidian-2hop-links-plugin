import React from "react";
import { FileEntity } from "../model/FileEntity";
import LinkView from "./LinkView";

interface NewLinksViewProps {
  fileEntities: FileEntity[];
  onClick: (fileEntity: FileEntity) => Promise<void>;
  getPreview: (fileEntity: FileEntity) => Promise<string>;
  boxWidth: string;
  boxHeight: string;
}

export default class NewLinksView extends React.Component<NewLinksViewProps> {
  constructor(props: NewLinksViewProps) {
    super(props);
  }

  render(): JSX.Element {
    if (this.props.fileEntities.length > 0) {
      return (
        <div className="twohop-links-section">
          <div
            className={"twohop-links-box twohop-links-new-links-header"}
            style={{
              width: this.props.boxWidth,
              height: this.props.boxHeight,
            }}
          >
            New links
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
