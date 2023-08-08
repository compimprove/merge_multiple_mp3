const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const INPUT_FOLDER_PATH = "Audio Basic 1";
const OUTPUT_FOLDER_PATH = "C:\\Users/ADMIN\\Downloads\\Audio Basic 1x10";
const TIME = 10;
const fileOutPut = (fileName) => {
    return `${fileName}x10.mp3`;
}

(async () => {
    function runCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${error}`);
                    return;
                }
                console.log(`Command ${command}`);
                resolve()
            });
        })
    }
    const files = await fs.readdir(INPUT_FOLDER_PATH);
    let fileProcess = 0;
    for (const file of files) {
        try {
            if (file.includes('.mp3')) {
                const filePath = path.join(INPUT_FOLDER_PATH, file);
                const fileName = path.basename(filePath, '.mp3');
                await runCommand(`ffmpeg -i "concat:${Array(TIME).fill(filePath).join("|")}" -acodec copy "${OUTPUT_FOLDER_PATH}/${fileOutPut(fileName)}"`)
                fileProcess++;
            }
        } catch (error) {
            console.error("Error while merge file", file, "Error", error);
        }

    }
    console.log(`File Process ${fileProcess}`);
})()

