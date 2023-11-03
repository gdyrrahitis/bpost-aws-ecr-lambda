import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from "aws-cdk-lib/aws-ecr";
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import * as ecrDeploy from "cdk-ecr-deployment";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class SimpleEcrLambdaCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const role = this.createLambdaRole();
    const repository = this.createEcrRepository();
    this.deployDockerImage(repository);
    this.createLambda(role, repository);
  }

  private createLambdaRole() {
    const role = new iam.Role(this, "CDKLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "container-image-lambda-role",
      description: "Creating role for container lambda",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
      ],
    });
    role.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    return role;
  }

  private createEcrRepository() {
    const repository = new ecr.Repository(this, "CDKEcrRepository", {
      repositoryName: "container-image-lambda-testing",
      imageScanOnPush: true,
      autoDeleteImages: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    repository.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    return repository;
  }

  private deployDockerImage(ecrRepository: cdk.aws_ecr.Repository) {
    const imageName = "container-image-lambda"
    const image = new DockerImageAsset(this, "CDKDockerImage", {
      directory: path.join(__dirname, "..", "lambda"),
      assetName: imageName,
    });

    new ecrDeploy.ECRDeployment(this, "CDKDeployDockerImage", {
      src: new ecrDeploy.DockerImageName(image.imageUri),
      dest: new ecrDeploy.DockerImageName(ecrRepository.repositoryUri),
    });
  }

  private createLambda(role: cdk.aws_iam.Role, ecrRepository: cdk.aws_ecr.Repository) {
    const image_lambda = new lambda.DockerImageFunction(this, "CDKEcrLambda", {
      code: lambda.DockerImageCode.fromEcr(ecrRepository),
      functionName: "container-image-lambda",
      timeout: cdk.Duration.seconds(20),
      role: role,
    });
    image_lambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
