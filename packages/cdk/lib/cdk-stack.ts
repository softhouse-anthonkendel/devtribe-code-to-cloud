import * as cdk from "aws-cdk-lib";
import * as gateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "node:path";

const pathFromRoot = (value: string) => path.resolve("../..", value);
const buildId = (value: string) => ["CodeToCloud", value].join("");

interface Props extends cdk.StackProps {
  localstack?: boolean;
}

export class CdkStack extends cdk.Stack {
  private localstack?: boolean;

  constructor(scope: Construct, id: string, props?: Props) {
    super(scope, id, props);

    this.localstack = props?.localstack;

    this.deployServer();
    !this.localstack && this.deployApp();
  }

  private deployServer() {
    const AWS_DYNAMODB_ENDPOINT = this.localstack
      ? "http://localhost.localstack.cloud:4566"
      : "";

    const serverLambda = new lambda.Function(this, buildId("Server"), {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "src/lambda-raw.handler",
      code: lambda.Code.fromAsset(pathFromRoot("packages/server")),
      timeout: cdk.Duration.seconds(30),
      environment: {
        AWS_DYNAMODB_ENDPOINT,
      },
    });
    const serverApi = new gateway.LambdaRestApi(this, buildId("ServerApi"), {
      handler: serverLambda,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowCredentials: true,
        allowMethods: gateway.Cors.ALL_METHODS,
        allowOrigins: gateway.Cors.ALL_ORIGINS,
      },
    });
    const burgersTable = new dynamodb.TableV2(this, buildId("TableBurgers"), {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.NUMBER,
      },
      tableName: "Burgers",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    burgersTable.grantFullAccess(serverLambda);

    return { serverLambda, serverApi, burgersTable };
  }

  private deployApp() {
    const appBucket = new s3.Bucket(this, buildId("App"), {
      autoDeleteObjects: true,
      bucketName: "devtribe-code-to-cloud",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
    });
    const appDistribution = new cloudfront.Distribution(
      this,
      buildId("AppDist"),
      {
        defaultBehavior: {
          origin: new cloudfrontOrigins.S3Origin(appBucket),
        },
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );

    const appDeployment = new s3Deployment.BucketDeployment(
      this,
      buildId("AppDeployment"),
      {
        sources: [s3Deployment.Source.asset(pathFromRoot("packages/app/dist"))],
        destinationBucket: appBucket,
        distribution: appDistribution,
        distributionPaths: ["/*"],
      }
    );

    return { appBucket, appDistribution, appDeployment };
  }
}
