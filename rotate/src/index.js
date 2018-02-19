const aws = require('aws-sdk');
const gm = require('gm').subClass({imageMagick: true});
const path = require('path');
const s3 = new aws.S3();

const destBucket = process.env.DEST_BUCKET;
const rotateDegrees = process.env.ROTATE_DEGREES;
const backgroundColor = process.env.BACKGROUND_COLOR;

exports.handler = function main(event, context) {
  // Fail on mising data
  if (!destBucket || !backgroundColor || !rotateDegrees) {
    context.fail('Error: Environment variable missing');
    return;
  }
  if (event.Records === null) {
    context.fail('Error: Event has no records.');
    return;
  }

  // Make a task for each record
  let tasks = [];
  for (let i = 0; i < event.Records.length; i++) {
    tasks.push(conversionPromise(event.Records[i], destBucket));
  }

  Promise.all(tasks)
    .then(() => { context.succeed(); })
    .catch((err) => {
      console.error('failed');
      console.error(JSON.stringify(event));
      console.error(JSON.stringify(context));
      context.fail(err);
    });
};

function conversionPromise(record, destBucket) {
  return new Promise((resolve, reject) => {
    // The source bucket and source key are part of the event data
    const srcBucket = record.s3.bucket.name;
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Modify destKey if an alternate copy location is preferred
    const destKey = srcKey;
    const conversion = 'rotating (' + rotateDegrees + '° ' + backgroundColor + '): ' + srcBucket + ':' + srcKey + ' to ' + destBucket + ':' + destKey;

    console.log('Attempting: ' + conversion);

    get(srcBucket, srcKey)
      .then(original => rotate(original))
      .then(modified => put(destBucket, destKey, modified))
      .then(() => {
        console.log('Success: ' + conversion);
        return resolve('Success: ' + conversion);
      })
      .catch(error => {
        console.error(error);
        return reject(error);
      });
  });
}

function get(srcBucket, srcKey) {
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: srcBucket,
      Key: srcKey
    }, (err, data) => {
      if (err) {
        console.error('Error getting object: ' + srcBucket + ':' + srcKey);
        return reject(err);
      } else {
        resolve(data.Body);
      }
    });
  });
}

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

function rotate(inBuffer) {
  return new Promise((resolve, reject) => {
    const data = gm(inBuffer).rotate(backgroundColor, rotateDegrees);
    gmToBuffer(data).then(outBuffer => {
      resolve(outBuffer);
    })
    .catch((err) => {
      console.error('Error applying rotate');
      return reject(err);
    });
  });
}

// From jescalan on https://github.com/aheckmann/gm/issues/572
function gmToBuffer (data) {
  return new Promise((resolve, reject) => {
    data.stream((err, stdout, stderr) => {
      if (err) { return reject(err); }
      const chunks = [];
      stdout.on('data', (chunk) => { chunks.push(chunk); });
      // these are 'once' because they can and do fire multiple times for multiple errors,
      // but this is a promise so you'll have to deal with them one at a time
      stdout.once('end', () => { resolve(Buffer.concat(chunks)); });
      stderr.once('data', (data) => { reject(String(data)); });
    });
  });
}
