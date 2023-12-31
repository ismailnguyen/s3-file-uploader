# s3-file-uploader
Tool to upload local files to a AWS S3 bucket

## Pre-requisites
- Have a Amazon Web Service (AWS) S3 bucket ([Create your first S3 bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html))
- Have a user with read/write access to the previous bucket with access key ([How do I create an AWS access key?](https://repost.aws/knowledge-center/create-access-key))

## Setup
- Create a `.env` file in the root (or rename the existing `.env.example` by removing the `.example` part)
- Add or edit the `.env` file configurations

### Example of `.env` file
```md
AWS_BUCKET_NAME=<PUT HERE YOUR AWS S3 BUCKET NAME>
AWS_REGION=<PUT HERE YOUR AWS S3 BUCKET REGION>
AWS_ACCESS_KEY=<PUT HERE YOUR AWS ACCESS KEY ID>
AWS_SECRET_ACCESS_KEY=<PUT HERE YOUR AWS ACCESS KEY SECRET>

```


## Usage

### Console
Run the following command in terminal:
```bash
npm run upload "<PUT HERE THE FOLDER PATH TO UPLOAD>"
```

#### Example
```bash
npm run review /Users/ishmaael/Downloads/Photos
```


### API
Run the following command in terminal:
```bash
npm run server
```

Make a `HTTP GET` call to the running localhost server to `/upload` endpoint with `` query string parameter.

#### Example
```bash
curl -X GET "http://localhost:3000/upload?folderToArchive=/Users/ishmaael/Downloads/Photos"
 
```
