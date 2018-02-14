# galleria

Serverless web application displaying a photo gallery

This application is designed to be used with [serverless-galleria](https://github.com/evanchiu/serverless-galleria), but it can also function as a generic web interface to images in S3 buckets.

## Deploy
* Create an S3 bucket to hold the thumbnail images
* Create an S3 bucket to hold the fullsize images
  * Note that if you're using a [serverless-galleria](https://github.com/evanchiu/serverless-galleria) image processing pipeline, then the fullsize bucket will probably be created by one of your transforms
* Hit "Deploy" from the [application](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~galleria) page

## Use
1. In the [API Gateway Console](https://console.aws.amazon.com/apigateway)
1. Navigate to APIs / aws-serverless-repository-galleria / Settings
    1. Hit Add Binary Media Type
    1. Enter `*/*` in the box
    1. Hit Save Changes
    1. Navigate to APIs / aws-serverless-repository-galleria / Resources
    1. Click the Actions dropdown
    1. Click Deploy API
        1. Deployment stage: **prod**
        1. Deployment description: *Adding binary support*
        1. Hit Deploy
1. Set up a [custom domain name](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html)
1. Open the custom domain in your browser to view the gallery

## Links
* [serverless-galleria](https://github.com/evanchiu/serverless-galleria) on Github
* [galleria](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~galleria) on the AWS Serverless Application Repository

## License
&copy; 2017-2018 [Evan Chiu](https://evanchiu.com). This project is available under the terms of the MIT license.
