const fs = require('fs');
const path = require('path');

class LocalFileReader {
    constructor (folderToRead) {
        this.folderToRead = folderToRead;
    }

    async readFile (filePath) {
        try {
            return await fs.promises.readFile(filePath);
        } catch (error) {
            console.error(`Failed to read ${filePath}: ${error.message}`);
            throw error;
        }
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

    getBasePath () {
        return this.folderToRead;
    }
}

module.exports = {
    LocalFileReader: LocalFileReader
}
