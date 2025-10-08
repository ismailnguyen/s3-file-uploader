const path = require('path');

class FileUploader {
    constructor (
        fileReader,
        fileUploader,
        targetPrefix = ''
    ) {
        this.fileReader = fileReader;
        this.fileUploader = fileUploader;
        this.targetPrefix = targetPrefix;
    }

    async upload () {
        const filePaths = this.fileReader.getFiles();
        const totalFiles = filePaths.length;

        if (totalFiles === 0) {
            console.log('No files found to upload.');
            return;
        }

        const basePath = this.fileReader.getBasePath();

        for (let index = 0; index < totalFiles; index++) {
            const filePath = filePaths[index];
            const relativePath = path.relative(basePath, filePath);
            const s3Key = this._buildS3Key(relativePath);
            this._logCurrentFile(index + 1, totalFiles, relativePath, s3Key);
            const fileContent = await this.fileReader.readFile(filePath);
            await this.fileUploader.upload(s3Key, fileContent);
            this._reportProgress(index + 1, totalFiles, s3Key);
        }
    }

    _buildS3Key (relativePath) {
        const normalizedRelativePath = relativePath.split(path.sep).join('/');
        const trimmedPrefix = this.targetPrefix.replace(/(^\/+|\/+$)/g, '');
        const normalizedPrefix = trimmedPrefix.split(path.sep).join('/');

        if (!normalizedPrefix) {
            return normalizedRelativePath;
        }

        if (!normalizedRelativePath) {
            return normalizedPrefix;
        }

        return `${normalizedPrefix}/${normalizedRelativePath}`;
    }

    _logCurrentFile (currentIndex, totalFiles, relativePath, s3Key) {
        const sourceDisplay = relativePath || path.basename(s3Key);
        console.log(`[${currentIndex}/${totalFiles}] Uploading ${sourceDisplay} (${s3Key})`);
    }

    _reportProgress (currentIndex, totalFiles, s3Key) {
        const percentage = Math.round((currentIndex / totalFiles) * 100);
        console.log(`[${currentIndex}/${totalFiles}] Uploaded ${s3Key} (${percentage}% complete)`);
    }
}

module.exports = {
    FileUploader: FileUploader
}
