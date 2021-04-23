import {TwoHopLink} from "../model/TwoHopLink";

import React from "react";
import {FileEntity} from "../model/FileEntity";
import LinkView from "./LinkView";

interface TwoHopLinksViewProps {
  twoHopLinks: TwoHopLink[];
  onClick: (fileEntry: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

export default class TwoHopLinksView extends React.Component<TwoHopLinksViewProps> {
  constructor(props: TwoHopLinksViewProps) {
    super(props);
  }

  render() {
    return (
        <div>
          {this.props.twoHopLinks.map(
              link => (
                  <div className='advanced-links-section' key={link.link}>
                    <div className={'advanced-links-twohop-header advanced-links-box'}>
                      {link.link}
                    </div>
                    {link.fileEntities.map(
                        it => <LinkView
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
