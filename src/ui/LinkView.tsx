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

  resizeImage(e: Event): void {
    const img = e.target as HTMLImageElement;
    const boxPreview = img.parentElement;
    const box = boxPreview.parentElement;
    const title = box.querySelector(".twohop-links-box-title");
    img.style.maxWidth = box.clientWidth - 10 + "px";
    img.style.maxHeight = box.clientHeight - title.clientHeight - 10 + "px";
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
        <div className={"twohop-links-box-preview"}>
          {this.state.preview && this.state.preview.match(/^app:\/\//) ? (
            <img
              src={this.state.preview}
              onLoad={this.resizeImage.bind(this)}
              alt={"preview image"}
            />
          ) : (
            <div>{this.state.preview}</div>
          )}
        </div>
      </div>
    );
  }
}
