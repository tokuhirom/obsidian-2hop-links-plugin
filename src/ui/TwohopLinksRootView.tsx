import { TwohopLink } from "../model/TwohopLink";

import React from "react";
import { FileEntity } from "../model/FileEntity";
import TwohopLinksView from "./TwohopLinksView";
import ConnectedLinksView from "./ConnectedLinksView";
import NewLinksView from "./NewLinksView";

interface TwohopLinksRootViewProps {
  connectedLinks: FileEntity[];
  newLinks: FileEntity[];
  twoHopLinks: TwohopLink[];
  onClick: (fileEntity: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

export default class TwohopLinksRootView extends React.Component<TwohopLinksRootViewProps> {
  constructor(props: TwohopLinksRootViewProps) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        <ConnectedLinksView
          fileEntities={this.props.connectedLinks}
          onClick={this.props.onClick}
          getPreview={this.props.getPreview}
        />
        <TwohopLinksView
          twoHopLinks={this.props.twoHopLinks}
          onClick={this.props.onClick}
          getPreview={this.props.getPreview}
        />
        <NewLinksView
          fileEntities={this.props.newLinks}
          onClick={this.props.onClick}
          getPreview={this.props.getPreview}
        />
      </div>
    );
  }
}
