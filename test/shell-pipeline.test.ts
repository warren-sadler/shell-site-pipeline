// import { Template } from '@aws-cdk/assertions';
import { expect as expectCDK, haveResourceLike } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { ShellPipelineStack } from "../lib/stacks/shell-pipeline-stack";

const app = new cdk.App();
new ShellPipelineStack(app, "ShellPipeline");

test("it has a code pipeline", () => {
  expectCDK(app).to(haveResourceLike("AWS::CodePipeline::Pipeline", {}));
});
