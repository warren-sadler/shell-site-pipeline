#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ShellPipelineStack } from "../lib/shell-pipeline-stack";
import { BillingStack } from "../lib/stacks/billing-stack";

const app = new cdk.App();
new BillingStack(app, "BillingStack", {
  budgetName: "ShellPipelineBudget",
  budgetLimit: 5,
  subscriberEmails: ["warren@therify.co"],
});
new ShellPipelineStack(app, "ShellPipelineStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
