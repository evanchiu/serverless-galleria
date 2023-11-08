import Jimp from "jimp";
import { handle } from "serverless-galleria-util";

/** Handle the event from s3 */
export async function handler(event) {
  const rotateDegrees = parseInt(process.env.ROTATE_DEGREES);
  const backgroundColor = process.env.BACKGROUND_COLOR;
  if (typeof rotateDegrees !== "number") {
    throw new Error("Error: Environment variable ROTATE_DEGREES missing");
  }
  if (!backgroundColor.match(/^#[0-9a-fA-F]{6}$/)) {
    throw new Error("Error: Expected BACKGROUND_COLOR hex format, e.g. \"#00CCFF\"")
  }
  console.log(`Rotating ${JSON.stringify(rotateDegrees, backgroundColor)}`);

  await handle(event, async (inBuffer) => {
    const image = await Jimp.read(inBuffer);
    image.background(Jimp.cssColorToHex(backgroundColor)).rotate(rotateDegrees);
    return image.getBufferAsync(Jimp.MIME_JPEG);
  });
}