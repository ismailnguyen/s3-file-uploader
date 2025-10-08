const path = require('path');

class FileUploader {
    constructor (
        fileReader,
        fileUploader,
        targetPrefix = '',
        uploadTracker = null
    ) {
        this.fileReader = fileReader;
        this.fileUploader = fileUploader;
        this.targetPrefix = targetPrefix;
        this.uploadTracker = uploadTracker;
    }

    async upload () {
        const filePaths = this.fileReader.getFiles();
        const basePath = this.fileReader.getBasePath();

        const fileEntries = filePaths.map(filePath => {
            const relativePath = path.relative(basePath, filePath);
            const s3Key = this._buildS3Key(relativePath);
            return {
                filePath,
                relativePath,
                s3Key
            };
        });

        let entriesToUpload = fileEntries;
        let skippedCount = 0;

        if (this.uploadTracker) {
            entriesToUpload = fileEntries.filter(entry => {
                const alreadyUploaded = this.uploadTracker.has(entry.s3Key);
                if (alreadyUploaded) {
                    skippedCount += 1;
                }
                return !alreadyUploaded;
            });

            if (skippedCount > 0) {
                console.log(`Skipping ${skippedCount} file(s) already present in ${this.uploadTracker.getLogPath()}.`);
            }
        }

        const totalFiles = entriesToUpload.length;

        if (totalFiles === 0) {
            const message = skippedCount > 0
                ? 'No new files to upload. All files have already been processed.'
                : 'No files found to upload.';
            console.log(message);
            await this._closeTracker();
            return;
        }

        try {
            for (let index = 0; index < totalFiles; index++) {
                const { filePath, relativePath, s3Key } = entriesToUpload[index];
                this._logCurrentFile(index + 1, totalFiles, relativePath, s3Key);
                const fileContent = await this.fileReader.readFile(filePath);
                await this.fileUploader.upload(s3Key, fileContent);
                if (this.uploadTracker) {
                    await this.uploadTracker.record(s3Key);
                }
                this._reportProgress(index + 1, totalFiles, s3Key);
            }
        } finally {
            await this._closeTracker();
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

    async _closeTracker () {
        if (this.uploadTracker && typeof this.uploadTracker.close === 'function') {
            await this.uploadTracker.close();
        }
    }
}

module.exports = {
    FileUploader: FileUploader
}
