import consola from "consola";
import { Command } from "commander";
import { Options } from "./options";
const program = new Command();
import gradient from "gradient-string";
import fetch from "node-fetch";
import { join } from "path";
import * as fs from "fs/promises";
import { existsSync } from "fs";
import "./forEachAsync";
import { IBingImageFeedProxy as IBingImageOfTheDayFeedProxy } from "./bingImageFeed.validator";
import chalk from "chalk";
var options = new Options(program);
consola.log(`Welcome to ${gradient(["#f26522", "#8dc63f", "#00aeef", "#ffc20e"])("-=<[ Bing Image-Of-The-Day Video Generator ]>=-")} ${options.version}`);
await ensurePathExists(options.cacheFolder);
await fs.rmdir(options.imageFolder, { recursive: true });
await ensurePathExists(options.imageFolder);
var images = [];
await options.locales.forEachAsync(async (locale) => {
    var feedData = await fetchBingImageOfTheDayFeedJSON(join(options.baseUrl, getFeedUrl(locale)));
    // Uncomment if we ever need to download a new json when the format changed.
    // fs.writeFileSync("examples/feed.json", JSON.stringify(feedData));
    if (feedData.images && feedData.images.length) {
        feedData.images.forEach((imageElement) => {
            imageElement["locale"] = locale;
            imageElement["key"] = imageElement.title + ";" + imageElement.copyright;
            if (images.filter((i) => i["key"] == imageElement["key"]).length == 0)
                images.push(imageElement);
        });
    }
});
await images.forEachConcurrent(async (imageElement) => {
    await downloadImage(imageElement, imageElement["locale"]);
    images.push(imageElement);
}, 6);
await fs.writeFile(join(options.imageFolder, "images.json"), JSON.stringify(images));
async function downloadImage(imageElement, locale) {
    var imageUrl = join(options.baseUrl, imageElement.url);
    var response = await fetch(imageUrl);
    var logMsg = `Download image from ${chalk.greenBright(locale)}: ${chalk.blueBright(imageElement["key"])}`;
    var arrayBuffer = await response.arrayBuffer();
    await fs.writeFile(join(options.imageFolder, imageElement.hsh + ".jpg"), Buffer.from(arrayBuffer));
    consola.success(logMsg);
    imageElement["locale"] = locale;
}
async function fetchBingImageOfTheDayFeedJSON(feedUrl) {
    return new Promise((resolve, reject) => {
        fetch(feedUrl)
            .then((res) => res.text())
            .then((data) => resolve(IBingImageOfTheDayFeedProxy.Parse(data)))
            .catch((error) => {
            reject(error);
        });
    });
}
function getFeedUrl(locale, start = 0, count = 10) {
    return options.feedUrlFormat
        .replace("{locale}", `${locale}`)
        .replace("{start}", `${start}`)
        .replace("{count}", `${count}`);
}
export async function ensurePathExists(path) {
    if (!existsSync(path))
        await fs.mkdir(path, { recursive: true });
}
//# sourceMappingURL=index.js.map