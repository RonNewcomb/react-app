// had to read the code to find require('react')
import 'react';

// how to make the below's  require('react')  return window.React ?
// search-and-replace   require(    with   await import(     ?  

import 'cjs-jsx-runtime';
const { jsx, jsxs, Fragment } = ReactJsxRuntime;
export { jsx, jsxs, Fragment }
