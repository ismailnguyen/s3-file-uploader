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

        for (const filePath of filePaths) {
            const fileContent = await this.fileReader.readFile(filePath);
            const relativePath = path.relative(this.fileReader.getBasePath(), filePath);
            const s3Key = this._buildS3Key(relativePath);
            await this.fileUploader.upload(s3Key, fileContent);
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
}

module.exports = {
    FileUploader: FileUploader
}
