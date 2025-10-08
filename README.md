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
npm run upload "<PUT HERE THE FOLDER PATH TO UPLOAD>" "[OPTIONAL TARGET PREFIX]"
```

#### Example
```bash
npm run upload /Users/ishmaael/Downloads/Photos backups/2024
```
> If you omit the target prefix, files are uploaded to the root of your bucket while preserving their relative folder structure.
> The CLI reports each file as it uploads, so you can track the current file and overall progress.


### API
Run the following command in terminal:
```bash
npm run server
```

Make a `HTTP GET` call to the running localhost server to `/upload` endpoint with `folderToArchive` and optional `targetPrefix` query string parameters.

#### Example
```bash
curl -G "http://localhost:3000/upload" \
    --data-urlencode "folderToArchive=/Users/ishmaael/Downloads/Photos" \
    --data-urlencode "targetPrefix=backups/2024"
 
```

## Ignoring Files

Create or edit `.fileignore` in the project root (or inside the folder you upload) to skip files or directories during uploads. The syntax is similar to `.gitignore` and supports comments (`#`), blank lines, `*` wildcards, and `**` to match across directories.

```txt
# ignore macOS metadata files
._*
.DS_Store
# ignore entire folders
cache/
```

Patterns are matched against the file paths relative to the folder you upload. Update this list to exclude any sensitive or unnecessary files from your S3 bucket.
