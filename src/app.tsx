import * as React from "react";
import { SideDrawer, openSideDrawer } from "./side-drawer";

export const App = () => (
  <div style={{ height: "100%" }}>
    <div onClick={openSideDrawer}>Click me to open the drawer</div>
    <SideDrawer />
  </div>
);
