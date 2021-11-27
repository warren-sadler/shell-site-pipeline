import * as path from "path";
import * as cdk from "@aws-cdk/core";
import { Pipeline, Artifact } from "@aws-cdk/aws-codepipeline";
import {
  BuildSpec,
  PipelineProject,
  LinuxBuildImage,
} from "@aws-cdk/aws-codebuild";
import {
  CodeBuildAction,
  GitHubSourceAction,
  GitHubTrigger,
} from "@aws-cdk/aws-codepipeline-actions";

export class ShellPipelineStack extends cdk.Stack {
  pipeline: Pipeline;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const pipelineSourceArtifact = new Artifact();
    const codepipelineBuildArtifact = new Artifact();
    this.pipeline = new Pipeline(this, "ShellPipeline", {
      pipelineName: "ShellSitePipeline",
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
    });
    const project = new PipelineProject(this, "ShellPipelineProject", {
      buildSpec: BuildSpec.fromSourceFilename(
        path.resolve(
          __dirname,
          "../../build-specs/shell-site-pipeline.build-spec.yaml"
        )
      ),
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_2,
      },
    });
    this.pipeline.addStage({
      stageName: "SourcePipelineFromGitHub",
      actions: [
        new GitHubSourceAction({
          actionName: "GitHub",
          branch: "main",
          owner: "warren-sadler",
          repo: "shell-site-pipeline",
          oauthToken: cdk.SecretValue.secretsManager(
            "shell-pipeline-access-token"
          ),
          output: pipelineSourceArtifact,
          trigger: GitHubTrigger.WEBHOOK,
        }),
      ],
    });
    this.pipeline.addStage({
      stageName: "BuildPipeline",
      actions: [
        new CodeBuildAction({
          actionName: "BuildPipeline",
          input: pipelineSourceArtifact,
          outputs: [codepipelineBuildArtifact],
          project,
        }),
      ],
    });
  }
}
