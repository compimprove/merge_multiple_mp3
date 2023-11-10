const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const fsExtra = require('fs-extra');

// Input parameters
const inputFolder =
  "/home/dinhnt/source/wedding-site/client/wedding-template-2/public/images";
const outputExtension = "webp";

async function scanFolder(folderPath) {
  const imageQueue = [];
  try {
    const files = await fs.promises.readdir(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        await scanFolder(filePath);
      } else {
        imageQueue.push(filePath);
      }
    }
    const chunkSize = 50;
    for (let i = 0; i < imageQueue.length; i += chunkSize) {
      const chunk = imageQueue.slice(i, i + chunkSize);
      await Promise.all(chunk.map(processImage));
    }
    console.log("Folder scanned done:", folderPath);
  } catch (err) {
    console.error("Error reading folder:", err);
  }
}

// Process each image file
async function processImage(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();
  const validExtensions = [".jpg", ".jpeg", ".jpe", ".png"];

  if (!validExtensions.includes(fileExtension)) {
    return;
  }

  try {
    await sharp(filePath).toFormat("webp").toFile(convertPathToWebp(filePath));
    await removeFile(filePath);
    console.log("Image processed:", filePath);
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

function removeFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function convertPathToWebp(filePath) {
  const lastPeriodIndex = filePath.lastIndexOf(".");
  if (lastPeriodIndex !== -1) {
    const webpFilePath = filePath.substring(0, lastPeriodIndex) + ".webp";
    return webpFilePath;
  }
  return filePath + ".webp";
}

async function copyFolder(sourceFolder, destinationFolder) {
  try {
    await fsExtra.copy(sourceFolder, destinationFolder);
    console.log("Folder copied successfully!");
  } catch (err) {
    console.error("Error copying folder:", err);
  }
}

(async () => {
  if (inputFolder && outputExtension) {
    let outputFolder = inputFolder + "-webp";
    await copyFolder(inputFolder, outputFolder);
    scanFolder(outputFolder);
  } else {
    console.error(
      "Please provide input_folder, and output_extension as command-line arguments."
    );
  }
})();
