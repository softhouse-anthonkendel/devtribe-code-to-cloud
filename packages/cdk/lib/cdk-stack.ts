import * as cdk from "aws-cdk-lib";
import { Cors, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "node:path";

const pathFromRoot = (value: string) => path.resolve("../..", value);
const buildId = (value: string) => ["CodeToCloud", value].join("");

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const serverLambda = new lambda.Function(this, buildId("Server"), {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "src/lambda-raw.handler",
      code: lambda.Code.fromAsset(pathFromRoot("packages/server")),
    });
    const lambdaApi = new LambdaRestApi(this, buildId("ServerApi"), {
      handler: serverLambda,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowCredentials: true,
        allowMethods: Cors.ALL_METHODS,
        allowOrigins: Cors.ALL_ORIGINS,
      },
    });

    const appBucket = new Bucket(this, buildId("App"), {
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
    const appDistribution = new Distribution(this, buildId("AppDist"), {
      defaultBehavior: {
        origin: new S3Origin(appBucket),
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });
    const appDeployment = new BucketDeployment(this, buildId("AppDeployment"), {
      sources: [Source.asset(pathFromRoot("packages/app/dist"))],
      destinationBucket: appBucket,
      distribution: appDistribution,
      distributionPaths: ["/*"],
    });
  }
}
