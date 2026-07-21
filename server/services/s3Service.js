const s3Client = require("../utils/s3Client");
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BUCKET = process.env.S3_BUCKET_NAME;

if (!BUCKET) {
  console.warn("S3_BUCKET_NAME is not set. S3 operations will fail without a bucket name.");
}

async function uploadBuffer({ key, buffer, contentType }) {
  if (!BUCKET) throw new Error("S3_BUCKET not configured");
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await s3Client.send(cmd);
  return { key };
}

async function getPresignedGetUrl({ key, expiresIn = 3600 }) {
  if (!BUCKET) throw new Error("S3_BUCKET not configured");
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const url = await getSignedUrl(s3Client, cmd, { expiresIn });
  return url;
}

async function deleteObject({ key }) {
  if (!BUCKET) throw new Error("S3_BUCKET not configured");
  const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await s3Client.send(cmd);
  return true;
}

module.exports = {
  uploadBuffer,
  getPresignedGetUrl,
  deleteObject,
};
