import chokidar from "chokidar";
import consola from "consola";
import TscWatchClient from "tsc-watch/client.js";

const logger = consola.withScope("watch");

export async function watch(build) {
  var stopTscWatch = await watchTsc();
  var stopWatch = await watchFiles(build);
  return async () => {
    await Promise.all(stopTscWatch(), stopWatch());
  };
}

async function watchTsc() {
  const tsWatch = new TscWatchClient({});
  return new Promise((resolve) => {
    // var options = process.argv.filter((argv) => argv.startsWith('-')).join(' ');
    tsWatch.on("first_success", async () => {
      resolve(async () => tsWatch.kill());
    });
    tsWatch.start("--noClear");
  });
}

async function watchFiles(build) {
  var filesToWatch = await build();
  var changeNotificationTimeout;
  logger.log(`Watching for changes in files used in web esbuild.`);
  var watcher = chokidar.watch(filesToWatch, { persistent: true });
  watcher.on("change", async (file) => {
    logger.log(`Changed: ${file}`);
    if (changeNotificationTimeout) {
      clearTimeout(changeNotificationTimeout);
    }

    changeNotificationTimeout = setTimeout(async () => {
      filesToWatch = await build();
      if (filesToWatch) {
        watcher.add(filesToWatch);
      }
    }, 100);
  });

  return async () => await watcher.close();
}
