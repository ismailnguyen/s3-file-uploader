class FileUploader {
    constructor (
        fileReader,
        fileUploader,
    ) {
        this.fileReader = fileReader;
        this.fileUploader = fileUploader;
    }

    async upload () {
        const filePaths = this.fileReader.getFiles();

        for (const filePath of filePaths) {
            const fileContent = await this.fileReader.readFile(filePath);
            await this.fileUploader.upload(filePath, fileContent);
        }
    }
}

module.exports = {
    FileUploader: FileUploader
}
