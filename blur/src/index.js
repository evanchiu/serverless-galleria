import Jimp from "jimp";
import { handle } from "serverless-galleria-util";

/** Handle the event from s3 */
export async function handler(event) {
  const blurRadius = parseInt(process.env.BLUR_RADIUS);
  if (typeof blurRadius !== "number") {
    throw new Error("Error: Environment variable BLUR_RADIUS missing");
  }
  console.log(`Transforming with blur radius (${blurRadius})`);
  
  await handle(event, async (inBuffer) => {
    const image = await Jimp.read(inBuffer);
    image.blur(blurRadius);
    return image.getBufferAsync(Jimp.MIME_JPEG);
  });
}
