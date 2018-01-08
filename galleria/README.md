# galleria

Serverless photo gallery

Demo: https://galleria.evanchiu.com

## Deploy with CloudFormation

Prerequisites: [Node.js](https://nodejs.org/en/) and [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) installed

* Create an [AWS](https://aws.amazon.com/) Account and [IAM User](https://aws.amazon.com/iam/) with the `AdministratorAccess` AWS [Managed Policy](http://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html)
* Run `aws configure` to put store that user's credentials in `~/.aws/credentials`
* Create an S3 bucket for storing the Lambda code and store its name in a shell variable with:
  * `export CODE_BUCKET=bucket`
* Create an S3 bucket from which to read the thumbnails, store its name in shell variable:
  * `export THUMB_BUCKET=bucket`
* Create an S3 bucket from which to read the full size images, store its name in shell variable:
  * `export FULL_BUCKET=bucket`
* Npm install:
  * `npm install`
* Build:
  * `npm run build`
* Upload package to S3, transform the CloudFormation template:
  * `npm run package`
* Deploy to CloudFormation:
  * `npm run deploy`

## Deploy from the AWS Serverless Application Repository
* Create the code, thumnail, and full size buckets
* Hit "Deploy" from the [application](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~galleria) page

## Use
* Go to [API Gateway](https://console.aws.amazon.com/apigateway/home) in the AWS Console to find the invoke URL and open it in your browser.
* Optionally, you can set up a [custom domain](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html)

## Links
* [serverless-galleria](https://github.com/evanchiu/serverless-galleria) on Github
* [galleria](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~galleria) on the AWS Serverless Application Repository
* Theme is [photo](https://freehtml5.co/photo-free-website-template-using-bootstrap-for-photographer/) from [freehtml5.co](https://freehtml5.co)

## License
&copy; 2017-2018 [Evan Chiu](https://evanchiu.com). This project is available under the terms of the MIT license.
