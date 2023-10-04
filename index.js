#! /usr/bin/env node
import fs from "fs/promises";
import { get_json_series, get_series_per_page } from "./utils/index.js";
import { program } from "commander";
import downloader from "nodejs-file-downloader";
import cliProgress from "cli-progress";

import colors from "ansi-colors";

const chapter_bar = new cliProgress.SingleBar({
  format:
    "Download progress |" +
    colors.cyan("{bar}") +
    "| {percentage}% || {value}/{total} chapters",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: true,
});

const series_bar = new cliProgress.SingleBar({
  format:
    "Download progress |" +
    colors.cyan("{bar}") +
    "| {percentage}% || {value}/{total} series",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: true,
});

program
  .name("yugen-download")
  .description("CLI to download series from yugen")
  .version("1.0.0");

program.argument(
  "<page>",
  "page of the query of series to be downloaded (1000 series per page)"
);
program.parse();

const page = program.args[0];

async function download(slug) {
  const json = await get_json_series(slug);
  await fs.mkdir(json.title);
  console.log("Number of chapters to be downloaded: " + json.chapters.length);
  chapter_bar.start(json.chapters.length, 0, {});
  for (let i = 0; i <= json.chapters.length - 1; i++) {
    const chapter = json.chapters[i];
    chapter_bar.update(i + 1);
    const images = chapter.chapter_data.images;
    const images_array = images.map(
      (image, index) =>
        new downloader({
          url: image.startsWith("https")
            ? image
            : `https://api.yugenmangas.net/${image}`,
          directory: `./${json.title}/${chapter.chapter_name}`,
          fileName: `${index}.jpg`,
          timeout: 15000,
          maxAttempts: 5,
        })
    );
    await Promise.all(images_array.map((item) => item.download()));
  }
  chapter_bar.stop();
}

async function init() {
  const json = await get_series_per_page(page);
  console.log("Number of series to be downloaded: " + json.length);
  series_bar.start(json.length, 0, {});
  for (let i = 0; i <= json.length - 1; i++) {
    try {
      series_bar.update(i + 1);
      await download(json[i]);
    } catch (error) {
      console.log(`Series ${json[i]} wasnt able to be downloaded`);
    }
  }
  series_bar.stop();
}

init();
