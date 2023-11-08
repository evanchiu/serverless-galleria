import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
const s3 = new S3Client();

/** Handle the s3 event by loading the s3 record files from s3, running the given transformer on each, saving to the dest bucket */
export async function handle(event, transformer) {
  // Fail on mising config
  const destBucket = process.env.DEST_BUCKET;
  if (!destBucket) {
    throw new Error("Error: Environment variable DEST_BUCKET missing");
  }

  // Transform all records
  await Promise.all(
    event.Records.map(async (record) => {
      const srcBucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
      console.log(
        `Transforming ${srcBucket}:${key} to ${destBucket}:${key}...`
      );
      const original = await get(srcBucket, key);
      const modified = await transformer(original);
      await put(destBucket, key, modified);
      console.log(`Transformed ${srcBucket}:${key} to ${destBucket}:${key}`);
    })
  );
}

/** Get file from S3 as a Buffer */
export async function get(bucket, key) {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
  return Buffer.concat(await response.Body.toArray());
}

/** Put data into S3 */
export async function put(bucket, key, data) {
  return s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
    })
  );
}

/** List the contents of an S3 bucket (up to first 1000 items) */
export async function list(bucket) {
  const response = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));
  return response.Contents;
}

/** We're done with this API Gateway lambda, return to the client with given parameters */
export function done(
  statusCode,
  body,
  contentType = "application/json",
  isBase64Encoded = false
) {
  return {
    statusCode: statusCode,
    isBase64Encoded: isBase64Encoded,
    body: body,
    headers: {
      "Content-Type": contentType,
    },
  };
}