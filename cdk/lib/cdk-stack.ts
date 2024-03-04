import * as cdk from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "node:path";

const pathFromRoot = (value: string) => path.resolve("..", value);
const buildId = (value: string) => ["CodeToCloud", value].join("");

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const server = new lambda.Function(this, buildId("Server"), {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "src/lambda-raw.handler",
      code: lambda.Code.fromAsset(pathFromRoot("server")),
    });
    const serverIntegration = new HttpLambdaIntegration(
      buildId("Integration"),
      server
    );
    const api = new HttpApi(this, buildId("Api"));
    api.addRoutes({
      path: "/{proxy+}",
      methods: [HttpMethod.ANY],
      integration: serverIntegration,
    });
  }
}
