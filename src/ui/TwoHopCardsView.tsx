import {path2title} from "../utils";
import {TwoHopLink} from "../model/TwoHopLink";

// backlinksContainer.createDiv({
//   cls: ['structured-link-clearfix']
// }, async el => {
//   for (const link of links) {
//     if (!twoHopLinks[link]) {
//       continue;
//     }
//     el.createEl('div', {
//       text: path2title(link),
//       cls: ['structured-link-header', 'structured-link-box']
//     })
//     for (const fe of twoHopLinks[link]) {
//       await this.createBox(el, fe)
//     }
//   }
// })

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
                            key={it.path}
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
