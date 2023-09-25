const {
    S3Client,
    PutObjectCommand
} = require("@aws-sdk/client-s3");

class S3FileUploader {
    constructor (
        awsBucketName,
        awsRegion,
        awsAccessKeyId,
        awsAccessKeySecret
    ) {
        this.awsBucketName = awsBucketName;

        this.awsS3Client = new S3Client({
            credentials: {
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsAccessKeySecret
            },
            region: awsRegion
        });
    }

    async upload (fileName, fileContent) {
        const uploadResponse = await this.awsS3Client.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: fileContent
        }));
    
        return uploadResponse;
    }
}

module.exports = {
    S3FileUploader: S3FileUploader
}
