# rotate

Copy and rotate images using Lambda.

## Deploy with CloudFormation

Prerequisites: [Node.js](https://nodejs.org/en/) and [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) installed

* Create an [AWS](https://aws.amazon.com/) Account and [IAM User](https://aws.amazon.com/iam/) with the `AdministratorAccess` AWS [Managed Policy](http://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html)
* Run `aws configure` to put store that user's credentials in `~/.aws/credentials`
* Create an S3 bucket for storing the Lambda code and store its name in a shell variable with:
  * `export CODE_BUCKET=bucket`
* Create the S3 bucket for the rotated output, store its name in shell variable:
  * `export DEST_BUCKET=bucket`
* Choose a name, but do NOT create the S3 bucket input comes from, store its name in shell variable:
  * `export SOURCE_BUCKET=bucket`
* Choose the number of degrees to rotate, store it in shell variable:
  * `export ROTATE_DEGREES=30`
* Choose the background color in hex (e.g. `#RRGGBB`), store it in shell variable:
  * `export BACKGROUND_COLOR='#00CCFF'`
* Npm install:
  * `npm install`
* Build:
  * `npm run build`
* Upload package to S3, transform the CloudFormation template:
  * `npm run package`
* Deploy to CloudFormation:
  * `npm run deploy`

## Deploy from the AWS Serverless Application Repository
* Create the destination bucket
* Hit "Deploy" from the [application](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~rotate) page

## Use
* Images that you put into the source bucket will be transformed, then put into the destination bucket

## Links
* [serverless-galleria](https://github.com/evanchiu/serverless-galleria) on Github
* [rotate](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~rotate) on the AWS Serverless Application Repository

## License
&copy; 2017-2018 [Evan Chiu](https://evanchiu.com). This project is available under the terms of the MIT license.
