import http from "http";
import path from "path";
import urls from "url";
import fs from "fs/promises";
import proc from "child_process";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;

const mimes = {
  ".ico": "image/x-icon",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".doc": "application/msword",
  ".eot": "application/vnd.ms-fontobject",
  ".ttf": "application/x-font-ttf",
};

const serverFolder = __dirname; // if someone moves this file server.ts into a /server/ folder or something
const projectFolder = "."; // might be ".." if serverFolder is under project root
const browserVisibleFolder = "public"; // cause you don't want the browser to see *everything*

const allowedMethods = { GET, CHECKOUT };

let cache: Record<string, Promise<ArrayBufferLike | string>> = {};
let cacheable = [".js", ".cjs", ".mjs"]; //, ".css"];
let parentResource: Record<string, string> = {};

const commandsToExec = ["npm run tsc"];
for (const command of commandsToExec)
  proc.exec(command, (error, stdout, stderr) => {
    if (error) throw error;
    console.log(stdout);
  });

http.createServer((req, res) => (allowedMethods[req.method!] || HTTP405)(req, res)).listen(4200);
console.log(`Server running at http://localhost:4200/`);

type Request = http.IncomingMessage;
type Response = http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage };

function HTTP405(_, response: Response) {
  response.writeHead(405, { Allow: Object.keys(allowedMethods).join() });
  response.end();
}

function projectRootedPath_From_BrowserRootedUrl(url: string | undefined, res: Response) {
  const absPath = path.normalize(path.join(__dirname, url || "/", url?.endsWith("/") ? "index.html" : ""));
  if (!absPath.startsWith(__dirname)) return res.writeHead(404), res.end(), "";

  let filePath = url || "/";
  if (filePath === "/") filePath = "/index.html";
  if (filePath.includes("node_modules")) filePath = "." + filePath;
  else filePath = ".\\" + path.join(browserVisibleFolder, filePath);
  if (!path.extname(filePath)) filePath += ".js";
  return path.normalize(filePath);
}

async function GET(request: Request, response: Response) {
  const filePath = projectRootedPath_From_BrowserRootedUrl(request.url, response);

  // if (request.headers["referer"]) {
  //   const url = new URL(request.headers["referer"]).pathname;
  //   console.log("referer", url); // if a importmap intervened then referer is still index.html
  //   parentResource[filePath] = projectRootedPath_From_BrowserRootedUrl(request.headers["referer"]); // if a importmap intervened then referer is still index.html
  // }

  if (!!cache[filePath] && request.headers["cache-control"] !== "no-cache" && cacheable.includes(path.extname(filePath))) {
    console.log("filePath", filePath, "(from cache)");
    response.writeHead(304);
    return response.end();
  }
  console.log("filePath", filePath);

  cache[filePath] = fs.readFile(filePath).then(content => conditionalTransform(content, filePath));
  return cache[filePath]
    .then(content => {
      response.writeHead(200, { "Content-Type": mimes[path.extname(filePath)], "Cache-Control": "max-age=31536000" });
      response.end(content);
    })
    .catch(error => {
      console.error(error);
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end(JSON.stringify(error));
    });
}

const classicScriptWithOldModuleSystem = {
  "node_modules\\object-assign\\index.js": true,
};

const dynamicRequire = `
  const xhr = new XMLHttpRequest();
  let response;
  xhr.onreadystatechange = event => response = event.target;
  xhr.open('GET', name, false);
  xhr.send();
  // return JSON.parse(response.responseText);
  const blob = new Blob([response.responseText], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  let module;
  import(url).then(m => module = m);
  while (!module) xhr.send();
  return module;
`;

function conditionalTransform(content: Buffer, filePath: string) {
  if (classicScriptWithOldModuleSystem[filePath] || filePath.includes("\\cjs\\") || filePath.endsWith(".cjs") || filePath.includes("\\umd\\")) {
    // TODO doesn't work  for  dynamic import   require(x ? "this" : "that")
    const text = content.toString();
    //const pieces: RegExpExecArray | null = new RegExp(/\brequire\s*\(([^\)]+)\)/g).exec(text);
    const imports: string[] = [];
    const requires: string[] = [];
    for (const match of text.matchAll(/\brequire\s*\(([^\)]+)\)/g)) {
      const packageId = match[1];
      const packageVar = packageId.replace(/[^a-zA-Z0-9]/g, "_");
      imports.push("import _require_", packageVar, " from ", packageId, ";\n");
      requires.push("\tif (m === ", packageId, ") return _require_", packageVar, ";\n");
    }
    const exports: Record<string, true> = {};
    for (const match of text.matchAll(/\bexports\.((\w|\d|_)+)/g)) exports[match[1]] = true;
    for (const match of text.matchAll(/\bmodule\.exports\.((\w|\d|_)+)/g)) exports[match[1]] = true;
    const exportsString = Object.keys(exports);
    return [
      imports,
      "const module = {exports:{}};\nlet exports = module.exports;\nwindow.process ||= {env:{}};\nfunction require(m) {\n",
      requires,
      dynamicRequire,
      " };\n",
      text,
      "\nexport default module.exports;\n",
      "const { ",
      exportsString,
      " } = module.exports;\nexport { ",
      exportsString,
      " };",
    ]
      .flat()
      .join("");
  }

  return content;
}

// not HMR really

let doneFunctions: Array<(filenames: string[]) => void> = [];

async function CHECKOUT(request: Request, response: Response) {
  const changedFilenames = await new Promise<string[]>(done => doneFunctions.push(done));
  response.setHeaders(new Headers({ "Content-Type": "text/plain" }));
  response.end(JSON.stringify(changedFilenames));
}

// accepts projectRootedPath
function clearCache(filePath: string, files: string[]) {
  if (!filePath) return files;
  delete cache[filePath];
  files.push(filePath);
  clearCache(parentResource[filePath], files);
  return files;
}

// endless loop
// const watcher = fs.watch(path.join(__dirname, browserVisibleFolder), { recursive: true, persistent: false });
// for await (const event of watcher) {
//   if (!event.filename || event.eventType !== "change") continue;
//   if (!cacheable.includes(path.extname(event.filename))) continue;
//   console.log("CHANGED", event.filename);
//   // watcher root will be browser root since browserVisibleFolder was passed to it
//   const filePathFromWatcherRoot = path.join(".", event.filename); // also fixes slashes // ex 'js\\index.js'
//   const filePathFromProjectRoot = projectRootedPath_From_BrowserRootedUrl(filePathFromWatcherRoot);
//   const filePathsFromProjectRootToReload = clearCache(filePathFromProjectRoot, []);
//   console.log({ filePathFromWatcherRoot, filePathFromProjectRoot, filePathsFromProjectRootToReload });
//   //const importPathFromBrowserRoot = "./" + filePathFromBrowserRoot.replace(/\\/g, "/");
//   const filePathsFromBrowserRootToReload = filePathsFromProjectRootToReload.map(f => projectRootedPath_From_BrowserRootedUrl(f));
//   //console.log("uncached", filePath, "sending", importPathFromBrowserRoot);
//   for (const done of doneFunctions) done(filePathsFromBrowserRootToReload);
//   doneFunctions = [];
// }
