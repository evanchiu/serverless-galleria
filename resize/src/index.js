import Jimp from "jimp";
import { handle } from "serverless-galleria-util";

/** Handle the event from s3 */
export async function handler(event) {
  const maxDimension = parseInt(process.env.MAX_DIMENSION);
  if (typeof maxDimension !== "number") {
    throw new Error("Error: Environment variable MAX_DIMENSION missing");
  }
  console.log(`Resizing to max dimension (${maxDimension})`);

  await handle(event, async (inBuffer) => {
    const image = await Jimp.read(inBuffer);
    image.scaleToFit(maxDimension, maxDimension);
    return image.getBufferAsync(Jimp.MIME_JPEG);
  });
}