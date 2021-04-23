import React from "react";

interface State {
  path: string;
  title: string;
  preview: string;
  onClick: (path: string, title: string) => void;
}


export default class CardView extends React.Component<State> {
  constructor(props: State) {
    super(props);
  }

  clicked(p1: React.MouseEvent<HTMLDivElement>) {
    return function () {
    };
  }

  render() {
    return (
        <div className={'structured-link-box'} onClick={() => this.props.onClick(this.props.path, this.props.title)}>
          <div className='structured-link-title'>{ this.props.title }</div>
          <div className={'structured-link-preview'}>{this.props.preview}</div>
        </div>
    );
  }
}
