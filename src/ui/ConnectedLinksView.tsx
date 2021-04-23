import React from "react";
import {FileEntity} from "../model/FileEntity";
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


  render() {
    return (
        <div className='structured-link-clearfix'>
          {this.props.fileEntities.map(
              it => {
                return <LinkView
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
