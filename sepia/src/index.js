const aws = require('aws-sdk');
const s3 = new aws.S3();
const path = require('path');
const gm = require('gm').subClass({imageMagick: true});

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
    .catch(() => { context.fail(); });
};

function conversionPromise(record, destBucket) {
  return new Promise((resolve, reject) => {
    // The source bucket and source key are part of the event data
    var srcBucket = record.s3.bucket.name;
    var srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Modify destKey if an alternate copy location is preferred
    var destKey = srcKey;
    var msg = 'sepia-ing ' + srcBucket + ':' + srcKey + ' to ' + destBucket + ':' + destKey;

    console.log('Attempting: ' + msg);
    // Get Object
    s3.getObject({
      Bucket: srcBucket,
      Key: srcKey,
    }, (err, data) => {
      if (err) {
        console.log('Error getting object:' + msg);
        console.log(err, err.stack); // an error occurred
        return reject('Error:' + msg);
      }

      // Convert to Sepia
      gm(data.Body).sepia().toBuffer('JPG', (err, buf) => {
        if (err) {
          console.log('Error converting to sepia:' + msg);
          console.log(err, err.stack); // an error occurred
          return reject('Error:' + msg);
        }

        // Put Object
        s3.putObject({
          Bucket: destBucket,
          Key: destKey,
          Body: buf
        }, (err, data) => {
          if (err) {
            console.log('Error putting object:' + msg);
            console.log(err, err.stack); // an error occurred
            return reject('Error:' + msg);
          }

          // Success
          console.log('Success: ' + msg);
          return resolve('Success: ' + msg);
        });
      });
    });
  });
}
