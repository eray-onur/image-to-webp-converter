const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const fs = require('fs');

const unoptimizedAssetsDir = './assets/unoptimized';
const optimizedAssetsDir = './assets/optimized';

async function start() {
    const filePaths = await fs.promises.readdir(unoptimizedAssetsDir);

    filePaths.forEach(fp => {
        const fileFullName = fp;
        const fileName = fileFullName.substring(0, fileFullName.indexOf('.'));
        const extension = fileFullName.substring(fileFullName.indexOf('.'), fileFullName.length);
    
        console.log(`Requested asset's name is: ${fileName}`)
        console.log(`Asset extension is: ${extension}`);

        ffmpeg().input(`${unoptimizedAssetsDir}/${fileFullName}`)
                .saveToFile(`${optimizedAssetsDir}/${fileName}.webp`);
    });

}

start();