import http from "http";
import path from "path";
import url from "url";
import fs from "fs/promises";
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

const publicFolder = "public";

const allowedMethods = { GET, PATCH };

let cache: Record<string, Promise<ArrayBufferLike>> = {};

http.createServer((req, res) => (allowedMethods[req.method!] || HTTP405)(req, res)).listen(4200);
console.log(`Server running at http://localhost:4200/`);

type Request = http.IncomingMessage;
type Response = http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage };

function HTTP405(_, response: Response) {
  response.writeHead(405, { Allow: Object.keys(allowedMethods).join() });
  response.end();
}

async function GET(request: Request, response: Response) {
  let filePath = (request.url || "").replace(/\.\./g, "") || "/";
  if (filePath == "/") filePath = "/index.html";
  if (!filePath.includes("node_modules")) filePath = path.join(publicFolder, filePath);

  const extname = path.extname(filePath);
  if (!extname) filePath = filePath + ".js";

  if (!!cache[filePath] && request.headers["cache-control"] !== "no-cache") {
    console.log("cached", filePath);
    response.writeHead(304);
    return response.end();
  }
  console.log("loading", filePath);

  cache[filePath] = fs.readFile(filePath);
  return cache[filePath]
    .then(content => {
      response.writeHead(200, { "Content-Type": mimes[extname] || mimes[".js"], "Cache-Control": "max-age=31536000" });
      response.end(content);
    })
    .catch(error => {
      console.error(error);
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end(JSON.stringify(error));
    });
}

// not HMR really

let doneFunctions: Array<(filenames: string[]) => void> = [];

async function PATCH(request: Request, response: Response) {
  const changedFilenames = await new Promise<string[]>(done => doneFunctions.push(done));
  response.setHeaders(new Headers({ "Content-Type": "text/plain" }));
  response.end(JSON.stringify(changedFilenames));
}

const watcher = fs.watch(path.join(__dirname, publicFolder), { recursive: true, persistent: false });
for await (const event of watcher) {
  if (!event.filename) continue;
  const importUrl = path.join(".", publicFolder, event.filename);
  console.log(event.eventType, event.filename, importUrl);
  for (const done of doneFunctions) done([importUrl]);
  doneFunctions = [];
}
