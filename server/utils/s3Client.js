const { S3Client } = require("@aws-sdk/client-s3");

// S3 / R2 client configured from environment variables.
// Required env vars:
// - S3_REGION (optional for R2 but some SDKs require)
// - S3_ENDPOINT (e.g. https://<accountid>.r2.cloudflarestorage.com)
// - S3_ACCESS_KEY_ID
// - S3_SECRET_ACCESS_KEY
// - S3_FORCE_PATH_STYLE (optional, 'true' or 'false')

// Accept alternative env var names used in this repo (.env):
// S3_API_ENDPOINT, S3_ACCESS_KEY, S3_SECRET
const region = process.env.S3_REGION || "auto";
const endpoint = process.env.S3_ENDPOINT || process.env.S3_API_ENDPOINT || undefined;
const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET;

const credentials = accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined;

if (!credentials) {
  console.warn(
    "S3 credentials not fully provided. Check S3_ACCESS_KEY_ID/S3_ACCESS_KEY and S3_SECRET_ACCESS_KEY/S3_SECRET env vars."
  );
}

const s3Client = new S3Client({
  region,
  endpoint,
  credentials,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
});

module.exports = s3Client;