# uploader

Serverless web application for uploading files to S3

This application is designed to be used with [serverless-galleria](https://github.com/evanchiu/serverless-galleria), but it can also function as a generic web to S3 file uploader.

## Deploy
* Create an S3 bucket to hold the uploaded content
  * Note that if you're using a [serverless-galleria](https://github.com/evanchiu/serverless-galleria) image processing pipeline, the bucket you'll upload to will be created by the transform
* Hit "Deploy" from the [application](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~uploader) page

## Use
1. In the [API Gateway Console](https://console.aws.amazon.com/apigateway)
1. Navigate to APIs / serverlessrepo-uploader / Dashboard
    1. Find the Invocation url, something like *https://xxxxxxxxx.execute-api.region.amazonaws.com/Prod/*
    1. (You can also set up [custom domain name](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html))
1. Open the invocation url in your browser, and drag photos on to the drop point to upload

## Links
* [serverless-galleria](https://github.com/evanchiu/serverless-galleria) on Github
* [uploader](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~uploader) on the AWS Serverless Application Repository

## License
&copy; 2017-2019 [Evan Chiu](https://evanchiu.com). This project is available under the terms of the MIT license.
