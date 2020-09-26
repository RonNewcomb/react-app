import * as React from "react";
import "./side-drawer.css";

export const openSideDrawer = (): Promise<void> =>
  new Promise(r => {
    SideDrawer.isOpen = true;
    SideDrawer.forceUpdate();
    SideDrawer.resolvePromise = r;
  });

export class SideDrawer extends React.Component {
  static isOpen = false;
  static resolvePromise = () => {};
  static forceUpdate = () => {};

  closeSideDrawer() {
    SideDrawer.isOpen = false;
    this.forceUpdate();
    SideDrawer.resolvePromise();
  }

  render() {
    SideDrawer.forceUpdate = this.forceUpdate.bind(this);
    return (
      <nav className={SideDrawer.isOpen ? "side-drawer open" : "side-drawer"}>
        <div className="side-nav" onClick={() => this.closeSideDrawer()}>
          <div className="side-items" data-href="/about">
            ABOUT
          </div>
          <div className="side-items" data-href="/contact">
            CONTACT US
          </div>
        </div>
      </nav>
    );
  }
}
