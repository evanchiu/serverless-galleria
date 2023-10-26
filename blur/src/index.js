import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
const client = new S3Client();
import Jimp from "jimp";

export async function handler(event) {
  // Fail on mising config
  const destBucket = process.env.DEST_BUCKET;
  const blurRadius = parseInt(process.env.BLUR_RADIUS);
  if (!destBucket) {
    throw new Error("Error: Environment variable DEST_BUCKET missing");
  } else if (typeof blurRadius !== "number") {
    throw new Error("Error: Environment variable BLUR_RADIUS missing");
  } else if (event.Records === null) {
    throw new Error("Error: Event has no records.");
  }

  // Transform all records
  await Promise.all(
    event.Records.map((record) => transform(record, destBucket, blurRadius))
  );
}

/* Transform the old record into the new one */
async function transform(record, destBucket, blurRadius) {
  // The source bucket and source key are part of the event data
  const srcBucket = record.s3.bucket.name;
  const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
  const destKey = srcKey;
  const transformation = `blurring (radius ${blurRadius}): ${srcBucket}:${srcKey} to ${destBucket}:${destKey}`;

  console.log("Attempting: " + transformation);
  const original = await get(srcBucket, srcKey);
  const modified = await blur(original, blurRadius);
  await put(destBucket, destKey, modified);
  console.log("Success: " + transformation);
}

// Get data from S3
async function get(bucket, key) {
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
  return Buffer.concat(await response.Body.toArray());
}

// Put data into S3
async function put(bucket, key, data) {
  return client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
    })
  );
}

async function blur(inBuffer, blurRadius) {
  const image = await Jimp.read(inBuffer);
  image.blur(blurRadius);
  return image.getBufferAsync(Jimp.MIME_JPEG);
}
