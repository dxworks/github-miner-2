import * as fs from "fs-extra";
import { GithubExtractor } from "../Extractors/GithubExtractor";
import { Commit } from "../types/Commit";
import { PrBranch } from "../types/PrBranch";
import { PullRequest } from "../types/PullRequest";
import { Repository } from "../types/Repository";
import { Review } from "../types/Review";
import { ReviewRequest } from "../types/ReviewRequest";
import { User } from "../types/User";

export class PullRequestProcessor {
  private extractor: GithubExtractor;

  constructor(extractor: GithubExtractor) {
    this.extractor = extractor;
  }

  async processPRs() {
    let allPRs: any[] = [];
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      const prs: any = await this.extractor.getPRs(cursor);
      allPRs = allPRs.concat(prs);
      console.log(`Processed ${prs.prs.length} PRs ${prs.endCursor}`);

      const lastPR = prs.prs[prs.prs.length - 1];

      if (lastPR) {
        cursor = prs.endCursor;
      }

      if (!prs.hasNextPage) break;
    }

    const folderPath = "exports";
    const filePath = `${folderPath}/pullRequests.json`;

    // Create the "exports" folder if it doesn't exist
    await fs.ensureDir(folderPath);

    fs.writeFileSync(
      filePath,
      JSON.stringify(allPRs[0].prs.map((pr: any) => this.mapPullRequest(pr)))
    );

    console.log(`Stored ${allPRs.length} pull requests in prs.json`);
  }

  private mapPullRequest(pr: any): PullRequest {
    return {
      number: pr.number,
      title: pr.title,
      body: pr.body,
      head: this.mapPrBranch(pr.headRef),
      base: this.mapPrBranch(pr.baseRef),
      commits: pr.commits.nodes.map((commit: any) => this.mapCommit(commit)),
      state: pr.state,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      mergedAt: pr.mergedAt,
      closedAt: pr.closedAt,
      createdBy: this.mapUser(pr.author),
      assignees: pr.assignees.nodes.map((assignee: any) =>
        this.mapUser(assignee)
      ),
      mergedBy: this.mapUser(pr.mergedBy),
      reviews: pr.reviews.nodes.map((review: any) => this.mapReview(review)),
      reviewRequests: pr.reviewRequests.nodes.map((reviewRequest: any) =>
        this.mapReviewRequest(reviewRequest)
      ),
    };
  }

  private mapPrBranch(branch: any): PrBranch | undefined {
    if (!branch) return;

    return {
      name: branch.name,
      commitUrl: branch.target.commitUrl,
      sha: branch.target.oid,
    };
  }

  private mapCommit(commit: any): Commit | undefined {
    if (!commit) return;

    return {
      url: commit.url,
      sha: commit.commit.oid,
      message: commit.commit.message,
      author: this.mapUser(commit.commit.author.user),
      date: commit.commit.authoredDate,
    };
  }

  private mapReview(review: any): Review | undefined {
    if (!review) return;

    return {
      state: review.state,
      user: this.mapUser(review.author),
      body: review.body,
      submittedAt: review.submittedAt,
    };
  }

  private mapReviewRequest(request: any): ReviewRequest {
    if (request.requestedReviewer.__typename === "User") {
      return {
        requestedReviewer: this.mapUser(request.requestedReviewer),
      };
    } else if (request.requestedReviewer.__typename === "Team") {
      return {
        requestedReviewer: {
          name: request.requestedReviewer.name,
          slug: request.requestedReviewer.slug,
        },
      };
    } else {
      return {};
    }
  }

  private mapUser(user: any): User | undefined {
    if (!user) return;

    return {
      login: user.login,
      url: user.url,
      avatarUrl: user.avatarUrl,
      email: user.email,
    };
  }
}
