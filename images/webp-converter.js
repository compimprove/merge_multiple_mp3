const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Input parameters
const inputFolder =
  "/home/dinhnt/source/wedding-site/client/linh-huyen/public/images/wedding";
const outputFolder =
  "/home/dinhnt/source/wedding-site/client/linh-huyen/public/images/wedding-webp";
const outputExtension = "webp";

async function scanFolder(folderPath) {
  const imageQueue = [];
  try {
    const files = await fs.promises.readdir(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        // Recursively scan subfolder
        await scanFolder(filePath);
      } else {
        // Process image file
        imageQueue.push(filePath);
      }
    }

    // Generate chunks of 50 elements on imageQueue
    const chunkSize = 50;
    for (let i = 0; i < imageQueue.length; i += chunkSize) {
      const chunk = imageQueue.slice(i, i + chunkSize);
      // Process each chunk of 10 elements
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
  const validExtensions = [".jpg", ".jpeg", ".jpe", ".png", ".webp"];

  if (!validExtensions.includes(fileExtension)) {
    return;
  }

  try {
    const metadata = await sharp(filePath).metadata();
    const { width, height } = metadata;
    const ratio = width / height;

    // Resize and crop image
    await sharp(filePath)
      .toFormat("webp")
      .toFile(
        getOutputFilePath(filePath, inputFolder, outputFolder, outputExtension)
      );
    console.log("Image processed:", filePath);
    // Handle the case when there is no matching aspect ratio
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

// Get output file path
function getOutputFilePath(
  filePath,
  inputFolder,
  outputFolder,
  outputExtension
) {
  const relativePath = path.relative(inputFolder, filePath);
  const outputFilePath = path.join(outputFolder, relativePath);
  const outputFilePathWithExtension =
    outputFilePath.slice(0, -path.extname(outputFilePath).length) +
    "." +
    outputExtension;
  return outputFilePathWithExtension;
}

// Check if required command-line arguments are provided
if (inputFolder && outputFolder && outputExtension) {
  // Start scanning the input folder
  scanFolder(inputFolder);
} else {
  console.error(
    "Please provide input_folder, output_folder, and output_extension as command-line arguments."
  );
}
