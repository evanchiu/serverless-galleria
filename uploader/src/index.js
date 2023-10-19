import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const client = new S3Client();
import { readFile } from "fs/promises";
import { lookup } from "mime-types";
import { join, resolve } from "path";

const DEST_BUCKET = process.env.DEST_BUCKET;

export async function handler(event) {
  // Fail on mising config
  if (!DEST_BUCKET) {
    console.error("Error: Environment variable DEST_BUCKET missing");
    return done(500, '{"message":"Internal Server Error"}');
  }

  if (event.path.startsWith("/api/file/")) {
    return fileRoute(event);
  } else {
    return servePublic(event);
  }
}

async function fileRoute(event) {
  console.log("Serving fileRoute");
  if (event.httpMethod === "POST") {
    let key = event.path.replace("/api/file/", "");

    // Get the body data
    let body = event.body;
    if (event.isBase64Encoded) {
      console.log("body is base-64 encoded");
      body = Buffer.from(event.body, "base64");
    }

    try {
      await put(DEST_BUCKET, key, body);

      let message = "Saved " + DEST_BUCKET + ":" + key;
      console.log(message);
      return done(200, JSON.stringify({ message }));
    } catch (error) {
      console.error(error);
      return done(500, '{"message":"error saving"}');
    }
  } else {
    return done(400, '{"message":"Invalid HTTP Method"}');
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
    return done(403, '{"message":"Forbidden"}', "application/json");
  }

  // Attempt to read the file, give a 404 on error
  try {
    const data = await readFile(filePath);
    if (
      mimeType === "image/png" ||
      mimeType === "image/jpeg" ||
      mimeType === "image/x-icon"
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

  let filePath = join(process.env.LAMBDA_TASK_ROOT, "public/index.html");
  // Read the file, fill in base_path and serve, or 404 on error
  try {
    const data = await readFile(filePath);
    let content = data.toString().replace(/{{base_path}}/g, base_path);
    return done(200, content, "text/html");
  } catch (error) {
    console.error("404", error);
    return done(404, '{"message":"Not Found"}');
  }
}

// We're done with this lambda, return to the client with given parameters
function done(
  statusCode,
  body,
  contentType = "application/json",
  isBase64Encoded = false
) {
  return {
    statusCode: statusCode,
    isBase64Encoded: isBase64Encoded,
    body: body,
    headers: {
      "Content-Type": contentType,
    },
  };
}

// Create a promise to put the data in the s3 bucket
async function put(destBucket, destKey, data) {
  const command = new PutObjectCommand({
    Bucket: destBucket,
    Key: destKey,
    Body: data,
  });
  return client.send(command);
}
