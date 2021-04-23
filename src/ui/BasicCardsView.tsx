import React from "react";
import {FileEntity} from "../model/FileEntity";
import CardView from "./CardView";

interface BasicCardsViewProps {
  fileEntities: FileEntity[];
  onClick: (fileEntry: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}


export default class BasicCardsView extends React.Component<BasicCardsViewProps> {
  constructor(props: BasicCardsViewProps) {
    super(props);
  }


  render() {
    return (
        <div className='structured-link-clearfix'>
          {this.props.fileEntities.map(
              it => {
                return <CardView
                    fileEntry={it}
                    key={it.key()}
                    onClick={this.props.onClick}
                    getPreview={this.props.getPreview}
                />
              }
          )}
        </div>
    );
  }
}
