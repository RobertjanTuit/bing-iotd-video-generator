import express from "express";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { JSDOM } from "jsdom";
import consola from "consola";
import { join } from "path";
import { Server } from "socket.io";
import chokidar from "chokidar";

var indexHtml;
var latestPageHash;

const app = express();
const server = createServer(app);
const io = new Server(server);
var watcher;

export async function serve(
  wwwroot,
  watch = false,
  index = "index.html",
  reloadScriptPath = "statics/live-reload.js",
  port = 3000
) {
  var indexHtmlPath = join(wwwroot, index);

  if (watch) {
    await indexWatchAndLiveReload(indexHtmlPath, reloadScriptPath, watch);
  }

  await loadIndexHtml(indexHtmlPath, reloadScriptPath, watch);

  app.get("/", async (req, res) => {
    res.send(indexHtml);
  });
  app.use(express.static(wwwroot));

  server.listen(port, async () => {
    consola.log(`Listening on port http://localhost:${port}`);
  });

  return async () => {
    server.close();
    watcher && watcher.close();
  };
}

async function indexWatchAndLiveReload(indexHtmlPath, reloadScriptPath, watch) {
  consola.log(`Watching for changes in ${indexHtmlPath}`);
  watcher = chokidar.watch(indexHtmlPath, { persistent: true });
  watcher.on("change", async () => {
    consola.log(`Detected changes in ${indexHtmlPath}`);

    await loadIndexHtml(indexHtmlPath, reloadScriptPath, watch);
    io.emit("hash", { latestPageHash });
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      consola.log(`Client disconnected.`);
    });
    socket.on("hash", ({ currentPageHash }) => {
      if (currentPageHash != latestPageHash) {
        consola.log(
          `Client connected with older hash ${currentPageHash}, messaging it to reload itself`
        );
        socket.emit("hash", { latestPageHash });
      } else {
        consola.log(
          `Client connected with latest build hash: ${currentPageHash}.`
        );
      }
    });
  });
}

async function loadIndexHtml(indexHtmlPath, reloadScriptPath, watch) {
  consola.log(`Loading ${indexHtmlPath}.`);
  indexHtml = (await readFile(indexHtmlPath)).toString();
  if (watch) {
    await addLiveReloadScripts(indexHtml, reloadScriptPath);
    io.emit("hash", { latestPageHash });
  }
}

async function addLiveReloadScripts(html, reloadScriptPath) {
  consola.log(`Adding live-reload scripts.`);
  var indexHtmlDom = new JSDOM(html);

  const socketIoScriptTag =
    indexHtmlDom.window.document.createElement("script");
  socketIoScriptTag.setAttribute("src", "/socket.io/socket.io.js");
  indexHtmlDom.window.document.body.appendChild(socketIoScriptTag);

  const reloadScriptTag = indexHtmlDom.window.document.createElement("script");
  reloadScriptTag.innerHTML = await readFile(reloadScriptPath);
  indexHtmlDom.window.document.body.appendChild(reloadScriptTag);

  latestPageHash = indexHtmlDom.window.document
    .querySelector("meta[name=hash]")
    .getAttribute("content");

  consola.log(`New index.html hash: ${latestPageHash}`);

  indexHtml = indexHtmlDom.serialize();
}
