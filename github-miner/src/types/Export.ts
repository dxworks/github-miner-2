import { Issue } from "./Issue";
import { PullRequest } from "./PullRequest";
import { Repository } from "./Repository";

export type GitHubProject = {
  repositoryInfo: Repository;
  issues: Issue[];
  pullRequests: PullRequest[];
};
