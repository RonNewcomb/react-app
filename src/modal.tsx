import * as React from "react";
import * as ReactDOM from "react-dom";

export function modal<T>(renderProp: (closeModal: (returnValue: T) => void) => JSX.Element): Promise<T> {
  const div = document.createElement("div");
  document.body.appendChild(div);
  return new Promise(resolve =>
    ReactDOM.render(
      <>
        <div style={{ position: "fixed", height: "100vh", width: "100vw", backgroundColor: "rgba(0,0,0,0.5)", pointerEvents: "none" }}></div>
        <div aria-label="Question." aria-modal="true" tabIndex={-1} style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
          {renderProp((modalReturnValue: T) => {
            document.body.removeChild(div);
            resolve(modalReturnValue);
          })}
        </div>
      </>,
      div,
      () => (div.contains(document.activeElement) ? undefined : (div as any).lastElementChild.focus())
    )
  );
}

const YesNo = ({ msg, close }: { msg: string; close: (answer: boolean) => void }) => (
  <div style={{ margin: "16px" }}>
    <div>{msg}</div>
    <button onClick={e => close(true)}>Yes</button>
    <button onClick={e => close(false)}>No</button>
  </div>
);

const answer = modal<boolean>(close => <YesNo msg="Do you like bananas?" close={close} />);
