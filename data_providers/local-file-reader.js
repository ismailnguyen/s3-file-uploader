const fs = require('fs');

class LocalFileReader {
    constructor (folderToRead) {
        this.folderToRead = folderToRead;
    }

    readFile (filePath, callback) {
        const readableStream = fs.createReadStream(filePath);
    
        readableStream.on('error', function (error) {
            console.log(`error: ${error.message}`);
        })
    
        readableStream.on('data', (chunk) => {
            callback(chunk);
        })
    }

    getFiles (dir, files = []) {
        // Start the recursivity by the folder to archive
        if (!dir) {
            dir = this.folderToRead;
        }

        const fileList = fs.readdirSync(dir);

        for (const file of fileList) {
          const name = `${dir}/${file}`;
          if (fs.statSync(name).isDirectory()) {
            getFiles(name, files);
          } else {
            files.push(name);
          }
        }
        return files;
    }
}

module.exports = {
    LocalFileReader: LocalFileReader
}
