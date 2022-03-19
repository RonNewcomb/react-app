import * as React from "react";
import { useState } from "react";
import { ModalProps, Modal } from "react-bootstrap";
import * as ReactDOM from "react-dom";

export interface CloseModalFn<T> {
  (returnValue?: T): void;
}

interface PromiseModalProps<T> {
  closeModalFn: CloseModalFn<T>;
  renderProp: (close: CloseModalFn<T>) => JSX.Element;
  modalOptions?: Omit<ModalProps, "show" | "onHide">;
}

const PromiseModal = <T,>({ renderProp, closeModalFn, modalOptions }: PromiseModalProps<T>) => {
  const [shown, setShown] = useState(true);
  const closeFn = (modalResult?: T) => {
    setShown(false);
    closeModalFn(modalResult);
  };
  return (
    <Modal onHide={() => closeFn()} show={shown} {...modalOptions}>
      {renderProp(closeFn)}
    </Modal>
  );
};

export function modal<T>(
  renderProp: (closeModal: CloseModalFn<T>) => JSX.Element,
  modalOptions: Omit<ModalProps, "show" | "onHide"> = {}
): Promise<T | undefined> {
  const atBottom = document.createElement("div");
  document.body.appendChild(atBottom);
  return new Promise(resolve => {
    const closeModalFn = (modalResult?: T) => {
      resolve(modalResult);
      document.body.removeChild(atBottom);
    };
    ReactDOM.render(<PromiseModal<T> renderProp={renderProp} closeModalFn={closeModalFn} modalOptions={modalOptions} />, atBottom);
  });
}
