import * as yaml from "yamljs";
import { GithubExtractor } from "./GithubExtractor";
import { PullRequestProcessor } from "./PullRequestProcessor";

const config = yaml.load("src/config.yml");

const extractor = new GithubExtractor(config);
const processor = new PullRequestProcessor(extractor);

processor.processPRs();
