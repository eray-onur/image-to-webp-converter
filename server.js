const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const fs = require('fs');

const assetDir = './assets/unoptimized';
const optimizedAssetsDir = `${assetDir}/optimized`;

const fastify = require('fastify')({
    logger: true
});


fastify.get('/*', async(request, reply) => {
    const url = request.url.slice(1);
    const fileName = url.substring(0, url.indexOf('.'));
    const extension = url.substring(url.indexOf('.'), url.length);
    console.log(`Requested asset name is: ${url}`);
    console.log(`Asset extension is: ${extension}`);
    let file;
    try {
        if(extension === '.webp') {
            console.log(`${optimizedAssetsDir}/${url}`);
            file = await fs.promises.readFile(`${optimizedAssetsDir}/${url}`);
            return file;
        } else {
            file = await fs.promises.readFile(`${assetDir}/${url}`);
            if(file) {
                // Convert the image asset to .webp format for further optimization.
                ffmpeg().input(`${assetDir}/${url}`).saveToFile(`${optimizedAssetsDir}/${fileName}.webp`);
                const optimizedFile = await fs.promises.readFile(`${optimizedAssetsDir}/${fileName}.webp`);
                return (optimizedFile) ? optimizedFile : file;
            }
        }
        
    } catch(err) {
        console.log(`Asset not found.`);
    }
    reply
        .code(404)
        .send({'message': 'Asset not found!'});
});

const start = async () => {
    try {
        await fastify.listen(3000);
    } catch(err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();