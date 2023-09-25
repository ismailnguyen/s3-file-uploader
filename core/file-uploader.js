class FileUploader {
    constructor (
        fileReader,
        fileUploader,
    ) {
        this.fileReader = fileReader;
        this.fileUploader = fileUploader;
    }

    async upload () {
        this.fileReader.getFiles().forEach(filePath => { 
            this.fileReader.readFile(filePath, fileContent => {
                this.fileUploader.upload(filePath, fileContent);
            });
        });
    }
}

module.exports = {
    FileUploader: FileUploader
}
