import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class SimplerEcrLambdaCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const role = this.createLambdaRole();
    this.createLambda(role);
  }

  private createLambdaRole() {
    const role = new iam.Role(this, "CDKLambdaRoleSimpler", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "container-image-lambda-role-simpler",
      description: "Creating role for container lambda",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
      ],
    });
    role.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    return role;
  }

  private createLambda(role: cdk.aws_iam.Role) {
    const image_lambda = new lambda.DockerImageFunction(this, "CDKEcrLambdaSimpler", {
      code: lambda.DockerImageCode.fromImageAsset(
        path.join(__dirname, "..", "lambda")
      ),
      functionName: "container-image-lambda-simpler",
      timeout: cdk.Duration.seconds(20),
      role: role,
    });
    image_lambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
