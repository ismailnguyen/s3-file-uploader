'use strict';

const Hapi = require('@hapi/hapi');
const uploadController = require('./controllers/upload-controller');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    // add routes
    server.route({
        method: 'GET',
        path: '/upload',
        handler: (request, h) => {
            return uploadController.upload(
                request.query.folderToArchive,
                request.query.targetPrefix,
                request.query.logPath
            );
        }
    });

    await server.start();

    console.log('Server running on %s', server.info.uri);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
