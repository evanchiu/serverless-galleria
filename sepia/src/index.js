import Jimp from "jimp";
import { handle } from "serverless-galleria-util";

/** Handle the event from s3 */
export async function handler(event) {
  console.log(`Applying sepia`);

  await handle(event, async (inBuffer) => {
    const image = await Jimp.read(inBuffer);
    image.sepia();
    return image.getBufferAsync(Jimp.MIME_JPEG);
  });
}