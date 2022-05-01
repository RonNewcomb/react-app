import * as React from "react";
import * as ReactDOM from "react-dom";

/**
 * Usage: const answer = await modal<boolean>(close => <YesNo ask="Do you like bananas?" close={close} />);
 * @param renderProp A function that creates JSX.Element using the closeModal function passed into it
 * @returns A promise of T which was the value given to the closeModal function
 */
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

const YesNo = ({ children, close }: { children: any; close: (answer: boolean) => void }) => (
  <div style={{ margin: "16px" }}>
    <div>{children}</div>
    <button onClick={e => close(true)}>Yes</button>
    <button onClick={e => close(false)}>No</button>
  </div>
);

const MultipleChoice = ({ children, answers, choose }: { children: any; answers: string[]; choose: (answer: string) => void }) => (
  <div style={{ margin: "16px" }}>
    <div>{children}</div>
    <div style={{ display: "flex" }}>
      {answers.map(c => (
        <button key={c} onClick={_ => choose(c)}>
          {c}
        </button>
      ))}
    </div>
  </div>
);

export const yesNoModal = (question: string | JSX.Element) => modal<boolean>(close => <YesNo close={close}>{question}</YesNo>);
export const choiceModal = (ask: string | JSX.Element, answers: string[]) =>
  modal<string>(close => (
    <MultipleChoice answers={answers} choose={close}>
      {ask}
    </MultipleChoice>
  ));

const examples = async () => {
  const examples: { [key: string]: any } = {
    answer1: await modal<boolean>(close => <YesNo close={close}>Do you like bananas?</YesNo>),
    answer2: await modal<React.MouseEvent>(close => <div onClick={close}>Click here to continue.</div>),
    answer3: await yesNoModal("Bananas?"),
    answer4: await choiceModal("Fruit?", ["Apples", "Bananas", "Oranges"]),
  };
  return examples;
};
