# crop

Serverless image crop

This application is designed to be used as a [serverless-galleria](https://github.com/evanchiu/serverless-galleria) transform, but it can also function as a generic JPEG crop tool.

## Deploy from the AWS Serverless Application Repository
* Create the destination bucket
  * Note that if you're using a [serverless-galleria](https://github.com/evanchiu/serverless-galleria) image processing pipeline, this bucket will be created by the following transform, unless this is the last transform.
* Hit "Deploy" from the [application](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~crop) page

## Use
* Images that you put into the source bucket will be transformed, then put into the destination bucket

## Links
* [serverless-galleria](https://github.com/evanchiu/serverless-galleria) on Github
* [crop](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~crop) on the AWS Serverless Application Repository

## License
&copy; 2017-2023 [Evan Chiu](https://evanchiu.com). This project is available under the terms of the MIT license.
