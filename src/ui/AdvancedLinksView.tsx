import {TwoHopLink} from "../model/TwoHopLink";

import React from "react";
import {FileEntity} from "../model/FileEntity";
import TwoHopCardsView from "./TwoHopCardsView";
import BasicCardsView from "./BasicCardsView";

interface AdvancedLinksViewProps {
  basicCards: FileEntity[];
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
          <BasicCardsView fileEntities={this.props.basicCards} onClick={this.props.onClick} getPreview={this.props.getPreview} />
          <TwoHopCardsView twoHopLinks={this.props.twoHopLinks} onClick={this.props.onClick} getPreview={this.props.getPreview} />
        </div>
    );
  }
}
