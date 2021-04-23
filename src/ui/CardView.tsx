import React from "react";
import {FileEntity} from "../model/FileEntity";

interface CardViewProps {
  fileEntry: FileEntity;
  onClick: (fileEntry: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

interface CardViewState {
  preview: string
}


export default class CardView extends React.Component<CardViewProps, CardViewState> {
  constructor(props: CardViewProps) {
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
