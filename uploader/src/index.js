const aws = require('aws-sdk');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const s3 = new aws.S3();

const destBucket = process.env.DEST_BUCKET;

exports.handler = main;

function main(event, context, lambdaCallback) {
  // Fail on mising data
  if (!destBucket) {
    context.fail('Error: Environment variable DEST_BUCKET missing');
    return;
  }

  if (event.path.startsWith('/api/file/')) {
    return fileRoute(event, context, lambdaCallback);
  } else {
    return servePublic(event, context, lambdaCallback);
  }
}

function fileRoute(event, context, lambdaCallback) {
  if (event.httpMethod === 'POST') {
    let key = event.path.replace('/api/file/', '');

    // Get the body data
    let body = event.body;
    if (event.isBase64Encoded) {
      console.log('body is base-64 encoded');
      body = Buffer.from(event.body, 'base64');
    }

    put(destBucket, key, body)
      .then(() => {
        message = 'Saved ' + destBucket + ':' + key;
        console.log(message);
        done(200, JSON.stringify({message:message}), 'application/json', lambdaCallback);
      })
      .catch((error) => {
        console.error(error);
        done(500, '{"message":"error saving"}', 'application/json', lambdaCallback);
      });
  } else {
    return done(400, '{"message":"Invalid HTTP Method"}', 'application/json', lambdaCallback);
  }
}

function servePublic(event, context, lambdaCallback) {
  // Set urlPath
  let urlPath;
  if (event.path === '/') {
    return serveIndex(event, context, lambdaCallback);
  } else {
    urlPath = event.path;
  }

  // Determine the file's path on lambda's filesystem
  const publicPath = path.join(process.env.LAMBDA_TASK_ROOT, 'public');
  const filePath = path.resolve(path.join(publicPath, urlPath));
  const mimeType = mime.lookup(filePath);

  // Make sure the user doesn't try to break out of the public directory
  if (!filePath.startsWith(publicPath)) {
    console.log('forbidden', filePath, publicPath);
    return done(403, '{"message":"Forbidden"}', 'application/json', lambdaCallback);
  }

  // Attempt to read the file, give a 404 on error
  fs.readFile(filePath, function(err, data) {
    if (err) {
      return done(404, '{"message":"Not Found"}', 'application/json', lambdaCallback);
    } else if (mimeType === 'image/png' ||
        mimeType === 'image/jpeg' ||
        mimeType === 'image/x-icon') {
      // Base 64 encode binary images
      return done(200, data.toString('base64'), mimeType, lambdaCallback, true);
    } else {
      return done(200, data.toString(), mimeType, lambdaCallback);
    }
  });
}

// Serve the index page
function serveIndex(event, context, lambdaCallback) {
  // Determine base path on whether the API Gateway stage is in the path or not
  let base_path = '/';
  if (event.requestContext.path.startsWith('/' + event.requestContext.stage)) {
    base_path = '/' + event.requestContext.stage + '/';
  }

  let filePath = path.join(process.env.LAMBDA_TASK_ROOT, 'public/index.html');
  // Read the file, fill in base_path and serve, or 404 on error
  fs.readFile(filePath, function(err, data) {
    if (err) {
      return done(404, '{"message":"Not Found"}', 'application/json', lambdaCallback);
    }
    let content = data.toString().replace(/{{base_path}}/g, base_path);
    return done(200, content, 'text/html', lambdaCallback);
  });
}

// We're done with this lambda, return to the client with given parameters
function done(statusCode, body, contentType, lambdaCallback, isBase64Encoded = false) {
  lambdaCallback(null, {
    statusCode: statusCode,
    isBase64Encoded: isBase64Encoded,
    body: body,
    headers: {
      'Content-Type': contentType
    }
  });
}

// Create a promise to put the data in the s3 bucket
function put(destBucket, destKey, data) {
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: destBucket,
      Key: destKey,
      Body: data
    }, (err, data) => {
      if (err) {
        console.error('Error putting object: ' + destBucket + ':' + destKey);
        return reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
