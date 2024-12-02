# A place to test random react stuff

## "buildless" server

### ESM import statements and classic development

If you want to serve js to the browser like in the old days, the new `import` statement will quickly become a blocker without a http server. This is because the `file://` protocol is CORS restricted.

NodeJS makes creating a server as easy as `node server.js` a file with contents:

```
import http from "http";

http.createServer((request, response) => {
    response.writeHead(200, { "Cache-Control": "max-age=31536000" });
    response.write("Hello world")
    response.end();
}).listen(4200);
```

But if we're going to have our very own `server.js` then we can add a few more lines for some pretty nice DX while still having access to all of npm's libraries without having a node_modules folder bigger than some videogames.

### importmap

The index.html has an import map so app code can understand bareword imports like `import * as React from 'react';` and transform that word into a path sent to the server.

However, this changes the `referer` header from the referer to the index.html, erasing information.

If this server wants to auto-update the importmap according to what it finds in node_modules, well, ok.

### Serving http files

The http method holds the name of the server function, such as `async function GET(request,response) ...`

GET serves files from either the project root or a "browser root" for simple security. It can perform an arbitrary `transform` on a file if desired, and can `cache` the file after reading from disk and transforming.

### Browser cache and 304 Not Modified

For speed it tries to use the browser cache as much as possible. `cache-control` can set an expiration, `max-age` for when a response is "no longer fresh". Before expiration the browser will not ask the server again. After expiration, the browser will ask the server, and the server can respond 304 so the file needn't be transferred again.

If a js file changes, then all files that imported it, directly or indirectly, have technically changed as well. So, index.html changes at all times, then?

The server doesn't know whether to send 304 or not because it doesn't know which version of a file the browser has. A dev server, having exactly one client, can track this though. But it would seem to be brittle because it would be a non-standard feature easy to forget.

(Could a cookie per file work? The cookie having the contents hash?)

### Typescript, SASS transforms

On startup a new thread spawns with `npm run tsc` so the user only needs one command to start things, `npm run server`. Typescript deposits the js files into the browser-visible folder, `public`.

This is done this way instead of transform-on-serve because some tools need a holistic view of the files at once.

### Noticing file changes with watchers

Node makes a file/folder watcher easy. An event handler gives you the name of the file changed. It's pretty chatty and seemingly fires for no reason so hashing the contents and checking for diff might be a good idea.

A paragraph in index.html performs a long-poll on http verb CHECKOUT. The event handler, if deciding the browser needs to be notified of any file changes, responds with the filenames.

(Currently it's a bit dysfunctional because even with the fetch to refresh cache, the page doesn't use this.)

### Module imports from npm node_modules

CommonJS runs scripts via giving it a local `modules` var which is an object, which has an `.exports` property, which holds an empty object for the user script to fill-in. A local var named `exports` points to this same empty object. It can be filled in with `exports.xxx = ` or with `module.exports = xxx` but if you want the default export to not be a container for exports but the actual, sole export, you must use `module.exports =`.

UMD encloses "the whole file" in a function called `factory` which has at least one parameter, an exports object to be filled in. Further inputs are imported modules. Before calling this factory function it uses a wrapper function that looks for the existance of other module systems:

1. if it finds CommonJS's module and exports objects, it calls its factory passing commonJs's exports object. It passes the results of `require` for each required parameter.
2. if it finds AMD's define function, it passes its would-be arguments to define, and the factory function itself.
3. Otherwise, it quickly ensures a globalThis (`window` in classic or `undefined` in ESM or `self` otherwise), sets a variable on it set to an empty object, and passes in any required modules via the assumption that they too are globals.

This server transforms CommonJS and UMD into ES6 ESM so client code can be pure ESM.

This server, on serving a js file which is CommonJS, wraps the commonJS code with a preamble that hoists `require` to become ESM `import` statements (no dynamic import) and `export default module.exports;` so the commonJS exports are exported to the ESM system. It uses simple regexes to do this so it can be fooled easily.

On serving a js file which is UMD, it uses UMD's understanding of CommonJS to use the same preamble. UMD by itself sets all of a file's exports to a global variable which app code might directly try to use instead, so this may not be the best method.

The alternate was a separate file which imports the UMD as side effects, and re-exports them. The side-effects preserve the global while also making ESM usage possible. This may require chunking response to serve 2 files for 1 request.

### Other

A lot of complication comes from urls to filepaths rooted from different spots. Perhaps using a `file://` url at all points would be simpler since Node's `path` and `url` modules speak this.

### Run

Have NodeJS v22+ installed. `npm run server` which will:

1. serve `node --watch --experimental-strip-types server.ts`
2. which will also `tsc --watch` for your convenience

Browse `http://localhost:4200`
