// tsc src\react-dom.ts --module esnext  --skipLibCheck
import "umd-react-dom";
const { createPortal, findDOMNode, flushSync, hydrate, render, unmountComponentAtNode, unstable_batchedUpdates, unstable_renderSubtreeIntoContainer, version } = window.ReactDOM;
export { createPortal, findDOMNode, flushSync, hydrate, render, unmountComponentAtNode, unstable_batchedUpdates, unstable_renderSubtreeIntoContainer, version };
export default window.ReactDOM;