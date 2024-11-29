// tsc src\jsx-runtime.ts --target es2020 --skipLibCheck
(function (exports: any) {
  /** @license React v17.0.2
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  "use strict";
  var react = require("react"),
    $$typeof: number | Symbol = 60103;
  exports.Fragment = 60107;
  if ("function" === typeof Symbol && Symbol.for) {
    var h = Symbol.for;
    $$typeof = h("react.element");
    exports.Fragment = h("react.fragment");
  }
  var internals = react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    internalProps = { key: !0, ref: !0, __self: !0, __source: !0 };
  function jsx(
    type: (string | Function) & { defaultProps?: object },
    attributes: Record<string, any>,
    defaultKey?: string | null
    // __source?: { fileName: string; lineNumber: number; columnNumber: number },
    // __self?: any
  ) {
    var attr: string,
      props = {},
      key: string | null = null,
      ref = null;
    void 0 !== defaultKey && (key = "" + defaultKey);
    void 0 !== attributes.key && (key = "" + attributes.key);
    void 0 !== attributes.ref && (ref = attributes.ref);
    for (attr in attributes) hasOwnProperty.call(attributes, attr) && !internalProps.hasOwnProperty(attr) && (props[attr] = attributes[attr]);
    if (type && type.defaultProps) for (attr in ((attributes = type.defaultProps), attributes)) void 0 === props[attr] && (props[attr] = attributes[attr]);
    return {
      $$typeof,
      type,
      key,
      ref,
      props,
      _owner: internals.current,
    };
  }
  exports.jsx = jsx;
  exports.jsxs = jsx;
})((globalThis.ReactJsxRuntime = {}));
