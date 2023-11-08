import Jimp from "jimp";
import { handle } from "serverless-galleria-util";

/** Handle the event from s3 */
export async function handler(event) {
  const width = parseInt(process.env.WIDTH);
  const height = parseInt(process.env.HEIGHT);
  let x = parseInt(process.env.X_COORDINATE);
  let y = parseInt(process.env.Y_COORDINATE);
  if (typeof width !== "number") {
    throw new Error("Error: Environment variable WIDTH missing");
  }
  if (typeof height !== "number") {
    throw new Error("Error: Environment variable HEIGHT missing");
  }
  if (typeof x !== "number") {
    throw new Error("Error: Environment variable X_COORDINATE missing");
  }
  if (typeof y !== "number") {
    throw new Error("Error: Environment variable Y_COORDINATE missing");
  }
  console.log(`Cropping ${JSON.stringify({ width, height, x, y })}`);

  await handle(event, async (inBuffer) => {
    const image = await Jimp.read(inBuffer);
    image.crop(x, y, width, height);
    return image.getBufferAsync(Jimp.MIME_JPEG);
  });
}