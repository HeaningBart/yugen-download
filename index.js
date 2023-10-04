#! /usr/bin/env node
import fs from "fs/promises";
import { get_json_series } from "./utils/index.js";
import { program } from "commander";
import downloader from "nodejs-file-downloader";
import cliProgress from "cli-progress";

import colors from "ansi-colors";

const bar = new cliProgress.SingleBar({
  format:
    "Download progress |" +
    colors.cyan("{bar}") +
    "| {percentage}% || {value}/{total} chapters",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: true,
});

program
  .name("yugen-download")
  .description("CLI to download series from yugen")
  .version("1.0.0");

program.argument("<slug>", "slug of the series to be downloaded");
program.parse();

const slug = program.args[0];

async function download() {
  const json = await get_json_series(slug);
  await fs.mkdir(json.title);
  console.log("Number of chapters to be downloaded: " + json.chapters.length);
  bar.start(35, 0, {});
  for (let i = 0; i <= json.chapters.length - 1; i++) {
    const chapter = json.chapters[i];
    bar.update(i + 1);
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
  bar.stop();
}

download();
