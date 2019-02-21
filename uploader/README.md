# uploader

Serverless web application for uploading files to S3

## Deploy with CloudFormation

Prerequisites: [Node.js](https://nodejs.org/en/) and [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) installed

* Create an [AWS](https://aws.amazon.com/) Account and [IAM User](https://aws.amazon.com/iam/) with the `AdministratorAccess` AWS [Managed Policy](http://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html)
* Run `aws configure` to put store that user's credentials in `~/.aws/credentials`
* Create an S3 bucket for storing the Lambda code and store its name in a shell variable with:
  * `export CODE_BUCKET=bucket`
* Create an S3 bucket for saving the uploaded files, store its name in shell variable:
  * `export DEST_BUCKET=bucket`
* Npm install:
  * `npm install`
* Build:
  * `npm run build`
* Upload package to S3, transform the CloudFormation template:
  * `npm run package`
* Deploy to CloudFormation:
  * `npm run deploy`

## Deploy from the AWS Serverless Application Repository
* Create the code and destination buckets
* Hit "Deploy" from the [application](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~uploader) page

## Use
* Go to [API Gateway](https://console.aws.amazon.com/apigateway/home) in the AWS Console to find the invoke URL and open it in your browser.
* Files you upload will be stored in the configured S3 bucket
* Optionally, you can set up a [custom domain](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html)

## Links
* [serverless-galleria](https://github.com/evanchiu/serverless-galleria) on Github
* [uploader](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~uploader) on the AWS Serverless Application Repository

## Limitations
Uploads happen in a single post.  The [lambda invocation payload limit is 6 MB](https://docs.aws.amazon.com/lambda/latest/dg/limits.html), and it gets transferred into lambda with [base64](https://en.wikipedia.org/wiki/Base64) encoding, which adds 33% overhead, in addition to the rest of the payload. The expected maximum upload size is around 4 MB.

## License
&copy; 2017-2019 [Evan Chiu](https://evanchiu.com). This project is available under the terms of the MIT license.
