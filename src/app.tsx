import * as React from "react";
import { useState, useCallback, useEffect } from "react";
import { modal } from "./modal";

export const App = () => {
  const onClickHandler = () => {
    const answe2 = modal<React.MouseEvent>(close => <div onClick={close}>Do you like bananas?</div>);
  };

  return (
    <div>
      <div>
        <C1 timeRange="c1timerange" />
      </div>
      <div>
        <C2 timeRange="c2timerange" />
      </div>
    </div>
  );
};

const genQuery = (timeRange: string, componentName: string, seed: number) => `${seed % 7}`;
const Loading = () => <h2>Loading</h2>;
const milliseconds = (ms: number) => new Promise(r => setTimeout(r, ms));

interface IProps {
  timeRange: string;
}

function useInterval(seconds: number) {
  const [dummy, setDummy] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setDummy(dummy + 1), seconds * 1000);
    return () => clearInterval(t);
  });
  return dummy;
}

type IUseAsync<T> = (T | undefined | boolean)[]; // [T | undefined, boolean];

function useAsync<T>(gettor: (...acceptsRest: any[]) => Promise<T>, rest: any[]): IUseAsync<T> {
  const [state, setState] = useState<IUseAsync<T>>([undefined, true]);
  const [parameters, setParameters] = useState(rest);

  if (parameters !== rest && parameters.some((_, i) => parameters[i] !== rest[i])) setParameters(rest); // change detection on parameters

  const callAsyncFn = useCallback(() => {
    gettor.apply(null, parameters).then(val => setState([val, false]));
  }, [gettor, parameters]);

  useEffect(callAsyncFn, [callAsyncFn]);

  return state;
}

async function getData(query: string, endpoint: string): Promise<string> {
  console.log("fetching for", endpoint, query);
  await milliseconds(Math.random() * 2000 + 1000);
  console.log("fetched", endpoint);
  return query;
}

function C1(props: IProps) {
  console.log("render C1", new Date().toLocaleTimeString());
  const [random] = useState(Math.random());
  const time = useInterval(15);
  const query = genQuery(props.timeRange, "c1", random);
  const [data, pending] = useAsync(getData, [query, "c1 #" + time]);
  return pending ? <Loading /> : <>Hi {data}</>;
}

function C2(props: IProps) {
  console.log("render C2", new Date().toLocaleTimeString());
  const [random] = useState(Math.random());
  const time = useInterval(10);
  const query = genQuery(props.timeRange, "c2", random);
  const [data, pending] = useAsync(getData, [query, "c2 #" + time]);
  return pending ? <Loading /> : <>Hello there {data}</>;
}
