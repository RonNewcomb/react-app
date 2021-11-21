import * as React from "react";
import { useEffect, useCallback, useState } from "react";

declare var ClickHandlerModule: { init(elementId: string, id?: string, email?: string, url?: string): () => void };
declare var ModalPopupModule: { init(isMobile: boolean): void };

type TeardownFnMaybe = void | (() => void);

export function useAmbientModule<T extends object>(
  nameOfModuleLoadedEvent: string,
  isPropsReady: () => boolean,
  getModuleOrNothing: () => undefined | T
): Promise<T> {
  const [teardown, setTeardown] = useState<TeardownFnMaybe>(() => () => {});

  const setupIfPossible = useCallback(() => {
    const module = getModuleOrNothing();
    if (typeof module === "undefined" || !isPropsReady()) return;
  }, []);

  useEffect(() => {
    document.body.addEventListener(nameOfModuleLoadedEvent, setupIfPossible);
    return () => document.body.removeEventListener(nameOfModuleLoadedEvent, setupIfPossible);
  }, [setupIfPossible, nameOfModuleLoadedEvent]);

  useEffect(() => {
    setupIfPossible();
    return () => (typeof teardown === "function" ? teardown() : undefined);
  }, [setupIfPossible, teardown]);

  const [promise, setPromise] = useState(new Promise((resolve, reject) => {}));

  return promise;
}

interface ICallAmProps {
  buttonLabel: string;
  id?: string;
  email?: string;
  url?: string;
  isMobile?: boolean;
}

export const CallAm = ({ buttonLabel, id, email, url, isMobile }: ICallAmProps) => {
  const ButtonId = "TheButton" + Date.now().toString();

  useAmbientModule(
    "ClickHandlerModule_Loaded",
    () => !!((id && email) || url),
    () => ClickHandlerModule
  ).then(() => ClickHandlerModule.init(ButtonId, id, email, url));

  useAmbientModule(
    "ModalPopupModule_Loaded",
    () => !!((id && email) || url),
    () => ModalPopupModule
  ).then(() => ModalPopupModule.init(isMobile ?? false));

  return (
    <div className="row">
      <div id={ButtonId} className="button">
        <span className="labelWIcon">{buttonLabel}</span>
      </div>
    </div>
  );
};
