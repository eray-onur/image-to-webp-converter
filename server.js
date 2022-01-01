require('dotenv').config();


const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const { pipeline } = require('stream');
const util = require('util');
const pump = util.promisify(pipeline);

const fs = require('fs');

// fastify initialization
const fastify = require('fastify')({
    logger: true
});

// form-data middleware
fastify.register(require('fastify-multipart'), {

});

// Controller for serving an already stored file as webp.
fastify.get('/*', async(request, reply) => {
    const url = request.url.slice(1);
    const fileName = url.substring(0, url.indexOf('.'));
    const extension = url.substring(url.indexOf('.'), url.length);
    console.log(`Requested asset name is: ${url}`);
    console.log(`Asset extension is: ${extension}`);
    let file;
    try {
        if(extension === '.webp') {
            console.log(`${process.env.OPTIMIZED_ASSETS_PATH}/${url}`);
            file = await fs.promises.readFile(`${process.env.OPTIMIZED_ASSETS_PATH}/${url}`);
            return file;
        } else {
            file = await fs.promises.readFile(`${process.env.UNOPTIMIZED_ASSETS_PATH}/${url}`);
            if(file) {
                // Convert the image asset to .webp format for further optimization.
                ffmpeg().input(`${process.env.UNOPTIMIZED_ASSETS_PATH}/${url}`).saveToFile(`${process.env.OPTIMIZED_ASSETS_PATH}/${fileName}.webp`);
                const optimizedFile = await fs.promises.readFile(`${process.env.OPTIMIZED_ASSETS_PATH}/${fileName}.webp`);
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

// Controller for handling conversions of uploaded file.
fastify.post('/*', async(request, reply) => {
    try {
        const data = await request.file();
        const filePath = `${process.env.UNOPTIMIZED_ASSETS_PATH}/${data.filename}`;
        await pump(data.file, fs.createWriteStream(filePath))
        const newFileName = data.filename.split('.')[0];

        // convert file
        ffmpeg().input(`${process.env.UNOPTIMIZED_ASSETS_PATH}/${data.filename}`)
        .saveToFile(`${process.env.OPTIMIZED_ASSETS_PATH}/${newFileName}.webp`);

        reply.header('Content-Disposition', `attachment; filename = ${newFileName}.webp`);
        reply.header('Content-Length', data.length);
        reply.type('image/webp');
        reply.send(fs.readFileSync(`${process.env.OPTIMIZED_ASSETS_PATH}/${newFileName}.webp`));

    } catch(ex) {
        throw Error('Failed to convert image.');
    }

});

const start = async () => {
    try {
        await fastify.listen(3009);
    } catch(err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();