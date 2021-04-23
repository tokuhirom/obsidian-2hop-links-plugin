import {TwoHopLink} from "../model/TwoHopLink";

import React from "react";
import {FileEntity} from "../model/FileEntity";
import TwoHopLinksView from "./TwoHopLinksView";
import ConnectedLinksView from "./ConnectedLinksView";
import NewLinksView from "./NewLinksView";

interface AdvancedLinksViewProps {
  connectedLinks: FileEntity[];
  newLinks: FileEntity[];
  twoHopLinks: TwoHopLink[];
  onClick: (fileEntry: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

export default class AdvancedLinksView extends React.Component<AdvancedLinksViewProps> {
  constructor(props: AdvancedLinksViewProps) {
    super(props);
  }

  render() {
    return (
        <div>
          <ConnectedLinksView fileEntities={this.props.connectedLinks} onClick={this.props.onClick} getPreview={this.props.getPreview} />
          <TwoHopLinksView twoHopLinks={this.props.twoHopLinks} onClick={this.props.onClick} getPreview={this.props.getPreview} />
          <NewLinksView fileEntities={this.props.newLinks} onClick={this.props.onClick} getPreview={this.props.getPreview} />
        </div>
    );
  }
}
