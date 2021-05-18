import React from "react";
import { FileEntity } from "../model/FileEntity";
import { removeBlockReference } from "../utils";

interface LinkViewProps {
  fileEntity: FileEntity;
  onClick: (fileEntity: FileEntity) => Promise<void>;
  getPreview: (fileEntity: FileEntity) => Promise<string>;
  boxWidth: string;
  boxHeight: string;
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
    const preview = await this.props.getPreview(this.props.fileEntity);
    this.setState({ preview });
  }

  render(): JSX.Element {
    return (
      <div
        className={"twohop-links-box"}
        onClick={async () => this.props.onClick(this.props.fileEntity)}
        // To overwrite CodeMirror's handler
        onMouseDown={async (event) =>
          event.button == 0 && this.props.onClick(this.props.fileEntity)
        }
        style={{ width: this.props.boxWidth, height: this.props.boxHeight }}
      >
        <div className="twohop-links-box-title">
          {removeBlockReference(this.props.fileEntity.linkText)}
        </div>
        <div className={"twohop-links-box-preview"}>{this.state.preview}</div>
      </div>
    );
  }
}
