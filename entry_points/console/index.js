require('dotenv').config();

const LocalFileReader = require('../../data_providers/local-file-reader').LocalFileReader;
const S3FileUploader = require('../../data_providers/aws-s3-uploader').S3FileUploader;
const FileUploader = require('../../core/file-uploader').FileUploader;

const main = async () => {
    // read folder to archive from user's input
    const folderToArchive = process.argv[2];
    if (!folderToArchive) {
        console.error('Please provide a folder name.');
        process.exit(1);
    }
    const localFileReader = new LocalFileReader(folderToArchive);

    const s3FileUploader = new S3FileUploader(
        process.env.AWS_BUCKET_NAME,
        process.env.AWS_REGION,
        process.env.AWS_ACCESS_KEY,
        process.env.AWS_SECRET_ACCESS_KEY
    );

    const fileUploader = new FileUploader(localFileReader, s3FileUploader);

    await fileUploader.upload();
}

main();
