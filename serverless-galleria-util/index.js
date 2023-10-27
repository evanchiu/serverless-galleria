import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
const s3 = new S3Client();

/** Read a file from one bucket, apply the transform, and store in another bucket */
export async function transformObject(srcBucket, srcKey, destBucket, destKey, transformBuffer) {
  const original = await get(srcBucket, srcKey);
  const modified = await transformBuffer(original);
  await put(destBucket, destKey, modified);
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