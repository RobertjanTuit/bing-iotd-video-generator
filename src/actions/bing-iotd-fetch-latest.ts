import chalk from "chalk";
import consola from "consola";
import { IAction } from ".";
import * as bingIotd from "./bing-iotd";
import { SlideShowOff } from "../slideshowoff";
import fs from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import fetch from "node-fetch";

export class bingIotdFetchLatest implements IAction {
  async execute(options: SlideShowOff): Promise<boolean> {
    await ensurePathExists(options.cacheFolder);
    await fs.rmdir(options.imageFolder, { recursive: true });
    await ensurePathExists(options.imageFolder);

    var images: Array<bingIotd.ImagesEntity> = [];

    await options.locales.forEachAsync(async (locale) => {
      var feedData = await fetchBingImageOfTheDayFeedJSON(
        join(options.baseUrl, getFeedUrl(locale))
      );

      // Uncomment if we ever need to download a new json when the format changed.
      // fs.writeFileSync("examples/feed.json", JSON.stringify(feedData));

      if (feedData.images && feedData.images.length) {
        feedData.images.forEach((imageElement) => {
          imageElement["locale"] = locale;
          imageElement["key"] =
            imageElement.title + ";" + imageElement.copyright;
          if (images.filter((i) => i["key"] == imageElement["key"]).length == 0)
            images.push(imageElement);
        });
      }
    });

    await images.forEachAsyncConcurrent(async (imageElement) => {
      await downloadImage(imageElement, imageElement["locale"]);
      images.push(imageElement);
    }, 6);

    await fs.writeFile(
      join(options.imageFolder, "images.json"),
      JSON.stringify(images)
    );

    return true;

    async function downloadImage(
      imageElement: bingIotd.ImagesEntity,
      locale: string
    ) {
      var imageUrl = join(options.baseUrl, imageElement.url);
      var response = await fetch(imageUrl);
      var logMsg = `Download image from ${chalk.greenBright(
        locale
      )}: ${chalk.blueBright(imageElement["key"])}`;
      var arrayBuffer = await response.arrayBuffer();
      await fs.writeFile(
        join(options.imageFolder, imageElement.hsh + ".jpg"),
        Buffer.from(arrayBuffer)
      );
      consola.success(logMsg);
      imageElement["locale"] = locale;
    }

    async function fetchBingImageOfTheDayFeedJSON(
      feedUrl
    ): Promise<bingIotd.IBingImageFeed> {
      return new Promise((resolve, reject) => {
        fetch(feedUrl)
          .then((res) => res.text())
          .then((data) => resolve(bingIotd.IBingImageFeedProxy.Parse(data)))
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

    async function ensurePathExists(path: string): Promise<void> {
      if (!existsSync(path)) await fs.mkdir(path, { recursive: true });
    }
  }

  public command = "bing-iotd-fetch-latest";
  public description = "Fetch latest images of the day from bing";
}
