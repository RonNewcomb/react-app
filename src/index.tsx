import { createRoot } from "react-dom/client";

// import { TransitionExperiment } from "./transition-experiment";
// createPortal(<TransitionExperiment />, document.querySelector("#react-app") || document.body);

import { App2 } from "./app2";
createRoot(document.querySelector("#react-app") || document.body).render(<App2 />);
