import Jimp from "jimp";
import { handle } from "serverless-galleria-util";

/** Handle the event from s3 */
export async function handler(event) {
  const quality = parseInt(process.env.QUALITY);
  if (typeof quality !== "number") {
    throw new Error("Error: Environment variable QUALITY missing");
  }
  console.log(`Transforming with quality (${quality})`);

  await handle(event, async (inBuffer) => {
    const image = await Jimp.read(inBuffer);
    image.quality(quality);
    return image.getBufferAsync(Jimp.MIME_JPEG);
  });
}
