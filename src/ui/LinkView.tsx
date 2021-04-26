import React from "react";
import { FileEntity } from "../model/FileEntity";

interface LinkViewProps {
  fileEntity: FileEntity;
  onClick: (fileEntity: FileEntity) => void;
  getPreview: (path: string) => Promise<string>;
}

interface LinkViewState {
  preview: string;
}

export default class LinkView extends React.Component<
  LinkViewProps,
  LinkViewState
> {
  constructor(props: LinkViewProps) {
    super(props);
    this.state = { preview: null };
  }

  async componentDidMount(): Promise<void> {
    const preview = await this.props.getPreview(
      this.props.fileEntity.sourcePath
    );
    this.setState({ preview });
  }

  render(): JSX.Element {
    return (
      <div
        className={"advanced-links-box"}
        onClick={() => this.props.onClick(this.props.fileEntity)}
      >
        <div className="advanced-links-box-title">
          {this.props.fileEntity.linkText}
        </div>
        <div className={"advanced-links-box-preview"}>{this.state.preview}</div>
      </div>
    );
  }
}
