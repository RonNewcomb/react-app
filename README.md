## A place to test random react stuff

## Notes

CommonJS runs scripts via giving it a local `modules` var which is an object, which has an `.exports` property, which holds an empty object for the user script to fill-in. A local var named `exports` points to this same empty object. It can be filled in with `exports.xxx = ` or with `module.exports = xxx` but if you want the default export to not be a container for exports but the actual, sole export, you must use `module.exports =`.

UMD encloses "the whole file" in a function called `factory` which has at least one parameter, an exports object to be filled in. Further inputs are imported modules. Before calling this factory function it uses a wrapper function that looks for the existance of other module systems:

1. if it finds CommonJS's module and exports objects, it calls its factory passing commonJs's exports object. It passes the results of `require` for each required parameter.
2. if it finds AMD's define function, it passes its would-be arguments to define, and the factory function itself.
3. Otherwise, it quickly ensures a globalThis (`window` in classic or `undefined` in ESM or `self` otherwise), sets a variable on it set to an empty object, and passes in any required modules via the assumption that they too are globals.

This server transforms CommonJS and UMD into ES6 ESM so client code can be pure ESM.

This server, on serving a js file which is CommonJS, wraps the commonJS code with a preamble that hoists `require` to become ESM `import` statements (no dynamic import) and `export default module.exports;` so the commonJS exports are exported to the ESM system. It uses simple regexes to do this so it can be fooled easily.

On serving a js file which is UMD, it uses UMD's understanding of CommonJS to use the same preamble.

### "buildless"

Have NodeJS v22+ installed.

Compile `tsc --watch`

Serve `node --watch --experimental-strip-types server.ts`

Browse `http://localhost:4200`
