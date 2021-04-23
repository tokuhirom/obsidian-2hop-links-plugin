import React from "react";
import {FileEntity} from "../model/FileEntity";

interface LinkViewProps {
  fileEntry: FileEntity;
  onClick: (fileEntry: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

interface LinkViewState {
  preview: string
}


export default class LinkView extends React.Component<LinkViewProps, LinkViewState> {
  constructor(props: LinkViewProps) {
    super(props);
    this.state = {preview: null}
  }

  async componentDidMount() {
    const preview = await this.props.getPreview(this.props.fileEntry.path)
    this.setState({ preview })
  }

  render() {
    return (
        <div className={'structured-link-box'} onClick={() => this.props.onClick(this.props.fileEntry)}>
          <div className='structured-link-title'>{ this.props.fileEntry.title }</div>
          <div className={'structured-link-preview'}>{this.state.preview}</div>
        </div>
    );
  }
}
