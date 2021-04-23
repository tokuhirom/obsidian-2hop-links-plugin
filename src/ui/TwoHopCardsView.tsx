import {TwoHopLink} from "../model/TwoHopLink";

import React from "react";
import {FileEntity} from "../model/FileEntity";
import CardView from "./CardView";

interface TwoHopCardsViewProps {
  twoHopLinks: TwoHopLink[];
  onClick: (fileEntry: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

export default class TwoHopCardsView extends React.Component<TwoHopCardsViewProps> {
  constructor(props: TwoHopCardsViewProps) {
    super(props);
  }

  render() {
    return (
        <div>
          {this.props.twoHopLinks.map(
              link => (
                  <div className='structured-link-clearfix' key={link.link}>
                    <div className={'structured-link-header structured-link-box'}>
                      {link.link}
                    </div>
                    {link.fileEntities.map(
                        it => <CardView
                            fileEntry={it}
                            key={it.key()}
                            onClick={this.props.onClick}
                            getPreview={this.props.getPreview}
                        />
                    )}
                  </div>
              )
          )}
        </div>
    );
  }
}
