const fs = require('fs');
const path = require('path');

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

        let fileList;
        try {
            fileList = fs.readdirSync(dir, { withFileTypes: true });
        } catch (error) {
            if (error.code === 'EPERM' || error.code === 'EACCES') {
                // Skip directories that the process cannot read due to permissions.
                console.warn(`Skipping directory ${dir}: ${error.message}`);
                return files;
            }
            throw error;
        }

        for (const entry of fileList) {
          const name = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            this.getFiles(name, files);
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
