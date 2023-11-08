import { readFile } from "fs/promises";
import { lookup } from "mime-types";
import { join, resolve } from "path";
import { done, get, list } from "../../serverless-galleria-util";

const THUMB_BUCKET = process.env.THUMB_BUCKET;
const FULL_BUCKET = process.env.FULL_BUCKET;

export async function handler(event) {
  // Fail on mising config
  if (!THUMB_BUCKET) {
    console.error("Error: Environment variable THUMB_BUCKET missing");
    return done(500, '{"message":"Internal Server Error"}');
  }
  if (!FULL_BUCKET) {
    console.error("Error: Environment variable FULL_BUCKET missing");
    return done(500, '{"message":"Internal Server Error"}');
  }

  if (
    event.path.startsWith("/api/thumb/") ||
    event.path.startsWith("/api/full/")
  ) {
    return imageRoute(event);
  } else {
    return servePublic(event);
  }
}

async function imageRoute(event) {
  if (event.httpMethod !== "GET") {
    return done(400, '{"message":"Invalid HTTP Method"}');
  }

  const bucket = event.path.startsWith("/api/thumb/")
    ? THUMB_BUCKET
    : FULL_BUCKET;
  const key = event.path.replace(/\/api\/(full|thumb)\//, "");
  const mimeType = lookup(key);

  try {
    const data = await get(bucket, key);
    if (
      mimeType === "image/png" ||
      mimeType === "image/jpeg" ||
      mimeType === "image/x-icon"
    ) {
      // Base 64 encode binary images
      console.log(`Serving binary ${bucket}:${key} (${mimeType})`);
      return done(200, data.toString("base64"), mimeType, true);
    } else {
      console.log(`Serving text ${bucket}:${key} (${mimeType})`);
      return done(200, data.toString(), mimeType);
    }
  } catch (error) {
    console.error(error);
    return done(500, '{"message":"Internal Server Error"}');
  }
}

async function servePublic(event) {
  console.log(`Serving public for ${event.path}`);
  // Set urlPath
  let urlPath;
  if (event.path === "/") {
    return serveIndex(event);
  } else {
    urlPath = event.path;
  }

  // Determine the file's path on lambda's filesystem
  const publicPath = join(process.env.LAMBDA_TASK_ROOT, "public");
  const filePath = resolve(join(publicPath, urlPath));
  const mimeType = lookup(filePath);

  // Make sure the user doesn't try to break out of the public directory
  if (!filePath.startsWith(publicPath)) {
    console.log("forbidden", filePath, publicPath);
    return done(403, '{"message":"Forbidden"}');
  }

  // Attempt to read the file, give a 404 on error
  try {
    const data = await readFile(filePath);
    if (
      mimeType === "image/png" ||
      mimeType === "image/jpeg" ||
      mimeType === "image/x-icon" ||
      mimeType === "application/font-woff" ||
      mimeType === "application/font-woff2" ||
      mimeType === "application/vnd.ms-fontobject" ||
      mimeType === "application/x-font-ttf"
    ) {
      // Base 64 encode binary images
      return done(200, data.toString("base64"), mimeType, true);
    } else {
      return done(200, data.toString(), mimeType);
    }
  } catch (e) {
    console.error("404", e);
    return done(404, '{"message":"Not Found"}');
  }
}

// Serve the index page
async function serveIndex(event) {
  console.log("Serving index");
  // Determine base path on whether the API Gateway stage is in the path or not
  let base_path = "/";
  if (event.requestContext.path.startsWith("/" + event.requestContext.stage)) {
    base_path = "/" + event.requestContext.stage + "/";
  }

  let filePath = join(
    process.env.LAMBDA_TASK_ROOT,
    "public/index.template.html"
  );
  const thumbBaseUrl =
    "https://" + event.headers.Host + base_path + "api/thumb/";
  const fullBaseUrl = "https://" + event.headers.Host + base_path + "api/full/";

  // Read the file, fill in base_path and serve, or 404 on error
  try {
    const [indexTemplate, images] = await Promise.all([
      readFile(filePath),
      list(THUMB_BUCKET),
    ]);

    const html = images
      .map((image) => {
        return `<article class="thumb">\n  <a href="${
          fullBaseUrl + image.Key
        }" class="image"><img src="${
          thumbBaseUrl + image.Key
        }" alt="" /></a>\n</article>\n`;
      })
      .join("\n");

    let output = indexTemplate.toString().replace("{{photos}}", html);
    return done(200, output, "text/html");
  } catch (error) {
    console.error("404", error);
    return done(404, '{"message":"Not Found"}');
  }
}
