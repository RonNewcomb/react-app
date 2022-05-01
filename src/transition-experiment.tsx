import * as React from "react";
import { useState, useEffect, PropsWithChildren, useMemo, FC, ReactNode } from "react";

export const TransitionExperiment = () => {
  const [data, setData] = useState([4, 5, 6]);

  useEffect(() => {
    const i = setInterval(() => setData(old => (old.includes(77) ? old.slice(0, 3) : old.concat(9, 77, 4))), 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div>
      <AnimateInOut<number>>
        {data.map(d => (
          <Item key={d} x={d}></Item>
        ))}
      </AnimateInOut>
    </div>
  );
};

const Item = ({ x }: { x: number }) => {
  return <div style={{ backgroundColor: "indianred", width: "8em", padding: "2em 8em", margin: "1em" }}>{x}</div>;
};

const AnimateInOut = <T,>({ children }: PropsWithChildren<{}>) => {
  const [kids, setKids] = useState({});
  if (!children) return <></>;
  if (!Array.isArray(children)) return <AnimateInOutHelper component={children}></AnimateInOutHelper>;
  if (children.length === 0) return <></>;

  const currentKids: Record<string, T> = {};
  children.forEach((child, i) => {
    const id = i.toString();
    currentKids[id] = child;
  });

  const currentKidIds = Object.keys(currentKids);
  const previousKidIds = Object.keys(kids);
  const arrivingChildren = currentKidIds.filter(k => !previousKidIds.includes(k));
  const leavingChildren = previousKidIds.filter(k => !currentKidIds.includes(k));

  // if (currentKidIds.length) console.log(" currentKidIds", JSON.stringify(currentKidIds));
  // if (previousKidIds.length) console.log("  previousKidIds", previousKidIds);

  if (leavingChildren.length) console.log("Leaving children", JSON.stringify(leavingChildren));
  if (arrivingChildren.length) {
    console.log("Arriving children", arrivingChildren);
    setKids(currentKidIds.concat(arrivingChildren));
  }

  return (
    <>
      {children.map((child, i) => {
        return <AnimateInOutHelper key={i} component={child}></AnimateInOutHelper>;
      })}
    </>
  );
};

const AnimateInOutHelper = <T,>({ component }: { component: ReactNode }) => {
  const previousRender = useMemo(() => component, [!!component]);
  return <>{component || previousRender}</>;
};
