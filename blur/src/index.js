import Jimp from "jimp";
import { transformObject } from "serverless-galleria-util";

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

  const transformBuffer = getTransformBuffer(blurRadius);

  // Transform all records
  await Promise.all(
    event.Records.map(async (record) => {
      // The source bucket and source key are part of the event data
      const srcBucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
      await transformObject(srcBucket, key, destBucket, key, transformBuffer);
      console.log(`blurred (radius ${blurRadius}): ${srcBucket}:${key} to ${destBucket}:${key}`);
    })
  );
}

function getTransformBuffer(blurRadius) {
  return async (inBuffer) => {
    const image = await Jimp.read(inBuffer);
    image.blur(blurRadius);
    return image.getBufferAsync(Jimp.MIME_JPEG);
  };
}
