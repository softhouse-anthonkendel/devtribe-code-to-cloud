#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";

const account = process.env.CDK_DEFAULT_ACCOUNT ?? "eu-north-1";
const region = process.env.CDK_DEFAULT_REGION;

const app = new cdk.App();

new CdkStack(app, "CodeToCloudStack", {
  env: {
    account,
    region,
  },
});
