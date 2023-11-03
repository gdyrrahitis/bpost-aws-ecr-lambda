## CDK Lambda ECR sample
Consists of 
* CDK to deploy Lambda and ECR container
* Lambda code to just fetch some data from a sample API
* Lambda wrapped into docker container
* 2 stacks to deploy Lambda, in one deploy image to ECR then deploy from ECR to Lambda, in second deploy docker image from local asset
