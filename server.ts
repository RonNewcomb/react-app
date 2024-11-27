import http from "http";
import path from "path";
import fs from "fs/promises";

http
  .createServer(async (request, response) => {
    let filePath = (request.url || "").replace(/\.\./g, "") || "/";
    if (filePath == "/") filePath = "/index.html";
    filePath = filePath.includes("node_modules") ? "." + filePath : "./public" + filePath;

    const extname = path.extname(filePath);
    if (!extname) filePath = filePath + ".js";
    console.log(filePath);

    let error: any;
    const content = await fs.readFile(filePath).catch(e => (error = e));

    if (!error) {
      response.writeHead(200, { "Content-Type": mime[extname] || mime[".js"] });
      response.end(content);
    } else {
      console.error(error);
      response.writeHead(error.code == "ENOENT" ? 404 : 500, { "Content-Type": "text/plain" });
      response.end(JSON.stringify(error));
    }
  })
  .listen(4200);

console.log(`Server running at http://localhost:4200/`);

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
