import * as React from "react";

declare var ClickHandlerModule: { init(elementId: string, id?: string, email?: string, url?: string): () => void };
declare var ModalPopupModule: { init(isMobile: boolean): void };

interface ICallAmProps {
  buttonLabel: string;
  id?: string;
  email?: string;
  url?: string;
  isMobile?: boolean;
}

export class CallAm extends React.Component<ICallAmProps> {
  private readonly ButtonId = "TheButton" + Date.now().toString();
  private unsub: () => void = () => void 0;

  render() {
    const { buttonLabel } = this.props;
    return (
      <div className="row">
        <div id={this.ButtonId} className="button">
          <span className="buttonWIcon">{buttonLabel}</span>
        </div>
      </div>
    );
  }

  private attachAmbientClickHandlerIfPossible = () => {
    if (typeof ClickHandlerModule === "undefined") return;
    const { id, email, url } = this.props;
    if ((id && email) || url) {
      this.unsub();
      this.unsub = ClickHandlerModule.init(this.ButtonId, id, email, url);
    }
  };

  private attachAmbientModalIfPossible = () => {
    if (typeof ModalPopupModule === "undefined") return;
    const { id, email, url, isMobile } = this.props;
    if ((id && email) || url) {
      ModalPopupModule.init(isMobile ?? false);
    }
  };

  componentDidMount() {
    document.body.addEventListener("ClickHandlerModule_Loaded", this.attachAmbientClickHandlerIfPossible);
    document.body.addEventListener("ModalPopupModule_Loaded", this.attachAmbientModalIfPossible);
    this.attachAmbientClickHandlerIfPossible();
    this.attachAmbientModalIfPossible();
  }

  componentDidUpdate(old: ICallAmProps) {
    const { id, email, url } = this.props;
    if (old.id != id || old.email != email || old.url != url) {
      this.attachAmbientClickHandlerIfPossible();
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener("ClickHandlerModule_Loaded", this.attachAmbientClickHandlerIfPossible);
    document.body.removeEventListener("ModalPopupModule_Loaded", this.attachAmbientModalIfPossible);
    this.unsub();
  }
}
