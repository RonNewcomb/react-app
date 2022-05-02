import * as React from "react";
import { useState, useEffect, PropsWithChildren, Component, useRef } from "react";
import { findDOMNode } from "react-dom";

export const TransitionExperiment = () => {
  const [data, setData] = useState([4, 5, 6]);

  useEffect(() => {
    const i = setInterval(() => setData(old => (old.includes(77) ? old.slice(0, 3) : old.concat(9, 77, 3))), 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div>
      <DelayUnmount by={500}>
        {data.map(d => (
          <MyItem key={d} x={d}></MyItem>
        ))}
      </DelayUnmount>
    </div>
  );
};

const MyItem = ({ x }: { x: number }) => (
  <div style={{ backgroundColor: "lightblue", width: "6em", padding: "0.5em", margin: "1em", transition: "width" }}>{x}</div>
);

////////////////////////////////////////////

type ChildId = number;

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

interface DelayUnmountComponent extends Component {
  key: ChildId;
}

const DelayUnmount = ({ children, by }: PropsWithChildren<{ by: number }>) => {
  const allChildrenInOrder = useRef<DelayUnmountComponent[]>([]);
  const fadingChilds = useRef<DelayUnmountComponent[]>([]);
  const [x, setX] = useState(1);

  const unmount = (c: DelayUnmountComponent) => {
    allChildrenInOrder.current = allChildrenInOrder.current.filter(each => each !== c);
    fadingChilds.current = fadingChilds.current.filter(each => each !== c);
  };

  const childs: DelayUnmountComponent[] = !children ? [] : Array.isArray(children) ? children : [children];
  let everChildren = [];
  let j = 0;
  for (let i = 0; i < childs.length; i++) {
    const child = childs[i];
    if (childs[i].key === allChildrenInOrder.current[j]?.key) {
      console.log("update");
      j++;
      everChildren.push(child);
    } else if (!allChildrenInOrder.current.some(c => c.key === child.key)) {
      console.log("add");
      allChildrenInOrder.current.splice(j, 0, child);
      j++; // retry the component that just got shifted down to j+1
      everChildren.push(child);
    } else {
      console.log("remove");
      // allChildrenInOrder[j] was removed from childs...
      const noLongerLive = allChildrenInOrder.current[j];
      j++; // don't retry j
      //i--; // retry i
      everChildren.push(noLongerLive);
      (findDOMNode(noLongerLive) as HTMLElement)!.style.width = "0";
      if (!fadingChilds.current.includes(noLongerLive))
        wait(by).finally(() => {
          console.log("done waiting");
          unmount(noLongerLive);
          setX(x + 1);
        });
    }
  }
  for (; j < allChildrenInOrder.current.length; j++) {
    console.log("remove from end");
    const noLongerLive = allChildrenInOrder.current[j];
    everChildren.push(noLongerLive);
    (findDOMNode(noLongerLive) as HTMLElement)!.style.width = "0";
    if (!fadingChilds.current.includes(noLongerLive))
      wait(by).finally(() => {
        console.log("done waiting");
        unmount(noLongerLive);
        setX(x + 1);
      });
  }

  console.log(allChildrenInOrder.current);

  return <>{everChildren}</>;
};
