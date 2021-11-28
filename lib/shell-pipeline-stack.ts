import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import * as route53 from "@aws-cdk/aws-route53";
import * as cdk from "@aws-cdk/core";
import { Pipeline, Artifact } from "@aws-cdk/aws-codepipeline";
import {
  BuildSpec,
  PipelineProject,
  LinuxBuildImage,
} from "@aws-cdk/aws-codebuild";
import {
  CloudFormationCreateUpdateStackAction,
  CodeBuildAction,
  GitHubSourceAction,
  GitHubTrigger,
  S3DeployAction,
} from "@aws-cdk/aws-codepipeline-actions";

export class ShellPipelineStack extends cdk.Stack {
  pipeline: Pipeline;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const pipelineSourceArtifact = new Artifact();
    const shellSiteSourceArtifact = new Artifact();
    const codepipelineBuildArtifact = new Artifact();
    const shellSiteBuildArtifact = new Artifact();
    const shellSiteBucket = new s3.Bucket(this, "shell-site-bucket", {
      bucketName: "test-deployment.therify-sandbox.com",
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const zone = route53.HostedZone.fromLookup(this, "zone", {
      domainName: "therify-sandbox.com",
    });
    new route53.CnameRecord(this, "cname-record", {
      zone,
      recordName: "test-deployment",
      domainName: shellSiteBucket.bucketWebsiteDomainName,
    });
    this.pipeline = new Pipeline(this, "ShellPipeline", {
      pipelineName: "ShellSitePipeline",
      crossAccountKeys: false,
      restartExecutionOnUpdate: true,
    });
    const pipelineProject = new PipelineProject(this, "ShellPipelineProject", {
      buildSpec: BuildSpec.fromSourceFilename(
        "build-specs/shell-site-pipeline.build-spec.yaml"
      ),
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_2,
      },
    });
    const shellSiteProject = new PipelineProject(this, "ShellSiteProject", {
      buildSpec: BuildSpec.fromSourceFilename("build-spec.yaml"),
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
        new GitHubSourceAction({
          actionName: "SourceShellSite",
          branch: "main",
          owner: "warren-sadler",
          repo: "shell-site",
          oauthToken: cdk.SecretValue.secretsManager(
            "shell-pipeline-access-token"
          ),
          output: shellSiteSourceArtifact,
          trigger: GitHubTrigger.WEBHOOK,
        }),
      ],
    });
    this.pipeline.addStage({
      stageName: "BuildPipeline",
      actions: [
        new CodeBuildAction({
          actionName: "CDKBuild",
          input: pipelineSourceArtifact,
          outputs: [codepipelineBuildArtifact],
          project: pipelineProject,
        }),
        new CodeBuildAction({
          actionName: "ShellSiteBuild",
          input: shellSiteSourceArtifact,
          outputs: [shellSiteBuildArtifact],
          project: shellSiteProject,
        }),
      ],
    });
    this.pipeline.addStage({
      stageName: "DeployShellSite",
      actions: [
        new S3DeployAction({
          actionName: "DeployShellSite",
          input: shellSiteBuildArtifact,
          bucket: shellSiteBucket,
        }),
      ],
    });
    this.pipeline.addStage({
      stageName: "UpdatePipeline",
      actions: [
        new CloudFormationCreateUpdateStackAction({
          actionName: "UpdatePipeline",
          stackName: "ShellPipelineStack",
          templatePath: codepipelineBuildArtifact.atPath(
            "ShellPipelineStack.template.json"
          ),
          adminPermissions: true,
        }),
      ],
    });
  }
}
