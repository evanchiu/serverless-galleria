const aws = require('aws-sdk');
const gm = require('gm').subClass({imageMagick: true});
const path = require('path');
const s3 = new aws.S3();

const destBucket = process.env.DEST_BUCKET;

exports.handler = function main(event, context) {
  // Fail on mising data
  if (!destBucket) {
    context.fail('Error: Environment variable DEST_BUCKET missing');
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
    .catch((err) => { context.fail(err); });
};

function conversionPromise(record, destBucket) {
  return new Promise((resolve, reject) => {
    // The source bucket and source key are part of the event data
    const srcBucket = record.s3.bucket.name;
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Modify destKey if an alternate copy location is preferred
    const destKey = srcKey;
    const conversion = 'converting ' + srcBucket + ':' + srcKey + ' to ' + destBucket + ':' + destKey;

    console.log('Attempting: ' + conversion);

    get(srcBucket, srcKey)
      .then(original => sepia(original))
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

function sepia(inBuffer) {
  return new Promise((resolve, reject) => {
    gm(inBuffer).sepia().toBuffer('JPG', (err, outBuffer) => {
      if (err) {
        console.error('Error applying sepia');
        return reject(err);
      } else {
        resolve(outBuffer);
      }
    });
  });
}
