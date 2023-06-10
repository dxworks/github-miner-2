import * as yaml from "yamljs";
import { GithubExtractor } from "./Extractors/GithubExtractor";
import { PullRequestProcessor } from "./Processors/PullRequestProcessor";
import { RepositoryProcessor } from "./Processors/RepositoryProcessor";

const config = yaml.load("configs/config.yml");

const extractor = new GithubExtractor(config);
const pullRequestProcessor = new PullRequestProcessor(extractor);
const repositoryProcessor = new RepositoryProcessor(extractor);

pullRequestProcessor.processPRs();
repositoryProcessor.processRepositoryInfo();
