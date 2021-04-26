import React from "react";
import { FileEntity } from "../model/FileEntity";
import LinkView from "./LinkView";

interface ConnectedLinksViewProps {
  fileEntities: FileEntity[];
  onClick: (fileEntry: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

export default class ConnectedLinksView extends React.Component<ConnectedLinksViewProps> {
  constructor(props: ConnectedLinksViewProps) {
    super(props);
  }

  render(): JSX.Element {
    if (this.props.fileEntities.length > 0) {
      return (
        <div className="advanced-links-section">
          <div
            className={
              "advanced-links-box advanced-links-connected-links-header"
            }
          >
            Links
          </div>
          {this.props.fileEntities.map((it) => {
            return (
              <LinkView
                fileEntry={it}
                key={it.key()}
                onClick={this.props.onClick}
                getPreview={this.props.getPreview}
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
