import * as React from "react";
import { useState, useCallback, useEffect } from "react";

export const App = () => (
  <div>
    <div>
      <C1 timeRange="c1timerange" />
    </div>
    <div>
      <C2 timeRange="c2timerange" />
    </div>
    {/* <div>
      <C3 timeRange="c3timerange" />
    </div>
    <div>
      <C4 timeRange="c4timerange" />
    </div>
    <div>
      <C5 timeRange="c5timerange" />
    </div> */}
  </div>
);

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
  const [parameters, setParameters] = useState(rest);
  const [state, setState] = useState<IUseAsync<T>>([undefined, true]);

  if (parameters !== rest && parameters.some((_, i) => parameters[i] !== rest[i])) setParameters(rest);

  const go = useCallback((): void => gettor.apply(null, parameters).then(val => setState([val, false])) && void 0, [gettor, parameters]);

  useEffect(go, [go]);

  return state;
}

async function getData(query: string, endpoint: string): Promise<string> {
  console.log("fetching for", endpoint);
  await milliseconds(Math.random() * 2000 + 1000);
  console.log("fetched for", endpoint);
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

// function C3(props: IProps) {
//   // useInterval(15);
//   const query = genQuery(props.timeRange, "c3", Math.random());
//   const [data, pending] = useAsync(getData, query, "c3");
//   return pending ? <Loading /> : <>Charlie {data} Tango</>;
// }

// function C4(props: IProps) {
//   //  useInterval(42);
//   const query = genQuery(props.timeRange, "c4", Math.random());
//   const [data, pending] = useAsync(getData, query, "c4");
//   return pending ? <Loading /> : <>A fox jumped {data}</>;
// }

// function C5(props: IProps) {
//   // useInterval(30);
//   const query = genQuery(props.timeRange, "c5", Math.random());
//   const [data, pending] = useAsync(getData, query, "c5");
//   return pending ? <Loading /> : <>{data} is king</>;
// }
