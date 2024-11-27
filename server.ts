import http from "http";
import path from "path";
import fs from "fs/promises";

const server = http.createServer(async (request, response) => {
  let filePath = (request.url || "").replace(/\.\./g, ""); // "current" folder is project root where server.ts is ran from
  if (filePath == "/") filePath = "/index.html";
  if (filePath?.includes("node_modules")) filePath = "." + filePath;
  else filePath = "./public" + filePath;

  const extname = path.extname(filePath);
  if (!extname) filePath = filePath + ".js";
  console.log(filePath);
  const contentType = mime[extname] || mime[".js"];

  let error: any;
  const content = await fs.readFile(filePath).catch(e => console.error((error = e)));

  if (!error) {
    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  } else {
    response.writeHead(error.code == "ENOENT" ? 404 : 500, { "Content-Type": "text/plain" });
    response.end(JSON.stringify(error));
  }
});

server.listen(4200, () => {
  console.log(`Server running at http://localhost:4200/`);
});

const mime = {
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
