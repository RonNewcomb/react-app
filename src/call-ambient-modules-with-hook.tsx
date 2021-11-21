import * as React from "react";
import { useEffect, useCallback, useState } from "react";

declare var ClickHandlerModule: { init(elementId: string, id?: string, email?: string, url?: string): () => void };
declare var ModalPopupModule: { init(isMobile: boolean): void };

type TeardownFnMaybe = void | (() => void);

export function useAmbientModule<T extends object>(
  nameOfModuleLoadedEvent: string,
  isPropsReady: () => boolean,
  getModuleOrNothing: () => undefined | T,
  setupFn: () => TeardownFnMaybe
) {
  const [teardown, setTeardown] = useState<TeardownFnMaybe>(() => () => {});

  const setupIfPossible = useCallback(() => {
    const module = getModuleOrNothing();
    if (typeof module === "undefined" || !isPropsReady()) return;
    if (typeof teardown === "function") teardown();
    setTeardown(setupFn());
  }, []);

  useEffect(() => {
    document.body.addEventListener(nameOfModuleLoadedEvent, setupIfPossible);
    setupIfPossible();
    return () => {
      document.body.removeEventListener(nameOfModuleLoadedEvent, setupIfPossible);
      if (typeof teardown === "function") teardown();
    };
  }, [nameOfModuleLoadedEvent, setupIfPossible, teardown]);
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
    () => ClickHandlerModule,
    () => ClickHandlerModule.init(ButtonId, id, email, url)
  );

  useAmbientModule(
    "ModalPopupModule_Loaded",
    () => !!((id && email) || url),
    () => ModalPopupModule,
    () => ModalPopupModule.init(isMobile ?? false)
  );

  return (
    <div className="row">
      <div id={ButtonId} className="button">
        <span className="labelWIcon">{buttonLabel}</span>
      </div>
    </div>
  );
};
