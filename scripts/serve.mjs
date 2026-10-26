import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import handler from "../api/enquiry.js";
const root = resolve("dist");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};
http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (url.pathname === "/api/enquiry") {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 12000) {
          res.writeHead(413);
          res.end();
          return;
        }
      }
      req.body = body;
      res.status = (c) => {
        res.statusCode = c;
        return res;
      };
      res.json = (data) => res.end(JSON.stringify(data));
      res.setHeader("Content-Type", "application/json");
      return handler(req, res);
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    if (pathname === "/index.html") {
      res.writeHead(308, { Location: "/" + url.search });
      res.end();
      return;
    }
    if (pathname.endsWith(".html") && pathname !== "/404.html") {
      try {
        await stat(resolve(root, "." + pathname));
        res.writeHead(308, { Location: pathname.slice(0, -5) + url.search });
        res.end();
        return;
      } catch {
        /* missing pages remain 404 */
      }
    }
    if (pathname !== "/" && pathname.endsWith("/")) {
      res.writeHead(308, { Location: pathname.slice(0, -1) + url.search });
      res.end();
      return;
    }
    const relative =
      pathname === "/"
        ? "/index.html"
        : extname(pathname)
          ? pathname
          : `${pathname}.html`;
    let file = resolve(root, "." + relative);
    let code = 200;
    if (!file.startsWith(root + "/")) {
      res.writeHead(403);
      res.end();
      return;
    }
    let data;
    try {
      data = await readFile(file);
    } catch {
      file = resolve(root, "404.html");
      data = await readFile(file);
      code = 404;
    }
    if (pathname === "/404" || pathname === "/404.html") code = 404;
    res.writeHead(code, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  })
  .listen(port, "127.0.0.1", () =>
    console.log(`Local: http://127.0.0.1:${port}`),
  );
