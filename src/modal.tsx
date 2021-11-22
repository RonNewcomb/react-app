import * as React from "react";
import * as ReactDOM from "react-dom";

export function modal<T>(renderProp: (closeModal: (returnValue: T) => void) => JSX.Element): Promise<T> {
  const overlay = document.createElement("div");
  overlay.setAttribute("style", "position:fixed; top:0; left:0; height:100vh; width:100vw; background-color:rgba(0,0,0,0.5)");
  document.body.appendChild(overlay);
  return new Promise(resolve =>
    ReactDOM.render(
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", backgroundColor: document.body.style.backgroundColor }}>
        {renderProp(modalResult => document.body.removeChild(overlay) && resolve(modalResult))}
      </div>,
      overlay
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

//const answe2 = modal<React.MouseEvent>(close => <div onClick={close}>Do you like bananas?</div>);
