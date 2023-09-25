require('dotenv').config();

const LocalFileReader = require('../../../data_providers/local-file-reader').LocalFileReader;
const S3FileUploader = require('../../../data_providers/aws-s3-uploader').S3FileUploader;
const FileUploader = require('../../../core/file-uploader').FileUploader;

const upload = async (folderToArchive) => {
    if (!folderToArchive) {
        console.error('Please provide a folder name.');
        return;
    }

    const s3FileUploader = new S3FileUploader(
        process.env.AWS_BUCKET_NAME,
        process.env.AWS_REGION,
        process.env.AWS_ACCESS_KEY,
        process.env.AWS_SECRET_ACCESS_KEY
    );

    const localFileReader = new LocalFileReader(folderToArchive);

    const fileUploader = new FileUploader(localFileReader, s3FileUploader);

    await fileUploader.upload();

    return `Folder ${ request.query.folderToArchive } was uploaded to bucket ${ process.env.AWS_BUCKET_NAME }!`;
}

module.exports = {
    upload: upload
}