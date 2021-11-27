#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ShellPipelineStack } from "../lib/stacks/shell-pipeline-stack";
import { BillingStack } from "../lib/stacks/billing-stack";

const app = new cdk.App();
new BillingStack(app, "BillingStack", {
  budgetName: "ShellPipelineBudget",
  budgetLimit: 5,
  subscriberEmails: ["warren@therify.co"],
});
new ShellPipelineStack(app, "ShellPipelineStack", {});
