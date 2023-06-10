import * as yaml from "yamljs";
import { GithubExtractor } from "./Extractors/GithubExtractor";
import { PullRequestProcessor } from "./Processors/PullRequestProcessor";
import { RepositoryProcessor } from "./Processors/RepositoryProcessor";
import { IssueProcessor } from "./Processors/IssueProcessor";

const config = yaml.load("configs/config.yml");

const extractor = new GithubExtractor(config);
const pullRequestProcessor = new PullRequestProcessor(extractor);
const repositoryProcessor = new RepositoryProcessor(extractor);
const issueProcessor = new IssueProcessor(extractor);

pullRequestProcessor.processPRs();
repositoryProcessor.processRepositoryInfo();
issueProcessor.processIssues();
