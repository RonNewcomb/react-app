import http from "http";
import path from "path";
import url from "url";
import fs from "fs/promises";
import proc from "child_process";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const serverFolder = __filename;
const projectFolder = ".";
const browserVisibleFolder = "public";

const allowedMethods = { GET, CHECKOUT };

let cache: Record<string, Promise<ArrayBufferLike | string>> = {};

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

function browserRootedUrlToProjectRootedPath(url?: string) {
  let filePath = (url || "").replace(/\.\./g, "") || "/";
  if (!filePath || filePath == "/") filePath = "/index.html";
  if (!filePath.includes("node_modules")) filePath = path.join(browserVisibleFolder, filePath);
  if (!path.extname(filePath)) filePath += ".js";
  return ".\\" + path.normalize(filePath);
}

async function GET(request: Request, response: Response) {
  const filePath = browserRootedUrlToProjectRootedPath(request.url);

  if (!!cache[filePath] && request.headers["cache-control"] !== "no-cache" && filePath !== "public\\index.html") {
    console.log("cached", filePath);
    response.writeHead(304);
    return response.end();
  }
  console.log("loading", filePath);

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

function conditionalTransform(content: Buffer, filePath: string) {
  if (filePath.includes("\\cjs\\") || filePath.endsWith(".cjs")) {
    console.log("-- CommonJS transform");
    return "export {}; var process = {env:{}};".concat(content.toString().replace(/\brequire\s*\(/g, "await import("));
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

// endless loop
const watcher = fs.watch(path.join(__dirname, browserVisibleFolder), { recursive: true, persistent: false });
for await (const event of watcher) {
  if (!event.filename || event.eventType !== "change") continue;
  console.log("CHANGED", event.filename);
  const filePathFromBrowserRoot = path.join(".", event.filename);
  // console.log(event.eventType, event.filename, filePath);
  const filePath = browserRootedUrlToProjectRootedPath(filePathFromBrowserRoot);
  delete cache[filePath];
  const importPathFromBrowserRoot = "./" + filePathFromBrowserRoot.replace(/\\/g, "/");
  console.log("uncached", filePath, "sending", importPathFromBrowserRoot);
  for (const done of doneFunctions) done([importPathFromBrowserRoot]);
  doneFunctions = [];
}

console.log("finished setup");
