import * as fs from "fs-extra";
import { Config } from "../Extractors/Config";
import { GithubExtractor } from "../Extractors/GithubExtractor";
import { IssueProcessor } from "./IssueProcessor";
import { PullRequestProcessor } from "./PullRequestProcessor";
import { RepositoryProcessor } from "./RepositoryProcessor";
import { PullRequest } from "../types/PullRequest";
import { Issue } from "../types/Issue";
import { Repository } from "../types/Repository";
import { GitHubProject } from "../types/Export";

export class Orchestrator {
  private config: Config;
  private extractor: GithubExtractor;
  private repositoryProcessor: RepositoryProcessor;
  private issueProcessor: IssueProcessor;
  private pullRequestProcessor: PullRequestProcessor;

  constructor(config: Config) {
    this.config = config;
    this.extractor = new GithubExtractor(config);
    this.repositoryProcessor = new RepositoryProcessor(this.extractor);
    this.issueProcessor = new IssueProcessor(this.extractor);
    this.pullRequestProcessor = new PullRequestProcessor(this.extractor);
  }

  async processData() {
    await Promise.all([
      this.pullRequestProcessor.processPRs(),
      this.repositoryProcessor.processRepositoryInfo(),
      this.issueProcessor.processIssues(),
    ]);

    await this.mergeDataIntoSingleFile();
  }

  private async mergeDataIntoSingleFile() {
    const folderPath = "exports";
    const combinedFilePath = `${folderPath}/githubProject.json`;

    let pullRequests: PullRequest[] = [];
    let issues: Issue[] = [];
    let repositoryInfo: Repository = {};

    try {
      pullRequests = JSON.parse(
        fs.readFileSync(`${folderPath}/pullRequests.json`, "utf8")
      );
    } catch (error) {
      console.log(
        "pullRequests.json not found or incomplete, continuing with available data."
      );
    }

    try {
      issues = JSON.parse(fs.readFileSync(`${folderPath}/issues.json`, "utf8"));
    } catch (error) {
      console.log(
        "issues.json not found or incomplete, continuing with available data."
      );
    }

    try {
      repositoryInfo = JSON.parse(
        fs.readFileSync(`${folderPath}/repositoryInfo.json`, "utf8")
      );
    } catch (error) {
      console.log(
        "repositoryInfo.json not found or incomplete, continuing with available data."
      );
    }

    const combinedData: GitHubProject = {
      repositoryInfo: repositoryInfo,
      issues: issues,
      pullRequests: pullRequests,
    };

    fs.writeFileSync(combinedFilePath, JSON.stringify(combinedData));
    console.log(`Stored all project data in ${combinedFilePath}`);
  }
}
