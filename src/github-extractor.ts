import { graphql } from "@octokit/graphql";
import { PullRequest } from "./types/PullRequest";
import { PrBranch } from "./types/PrBranch";
import { Commit } from "./types/Commit";
import { Repository } from "./types/Repository";
import { Review } from "./types/Review";
import { ReviewRequest } from "./types/ReviewRequest";
import { User } from "./types/User";

type Config = {
  owner: string;
  repository: string;
  tokens: string[];
};

export class GithubExtractor {
  private config: Config;
  private graphql: typeof graphql;

  constructor(config: Config) {
    this.config = config;
    this.graphql = graphql.defaults({
      headers: {
        authorization: `token ${this.config.tokens[0]}`,
      },
    });
  }

  async getPRs(cursor: number | null) {
    const query = `
      query ($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 100, states: [OPEN, CLOSED, MERGED], after: $cursor) {
            nodes {
              number
              title
              body
              state
              createdAt
              updatedAt
              mergedAt
              closedAt
              author {
                login
                url
                avatarUrl
                ... on User {                    
                      email              
                    }
              }
              assignees(first: 100) {
                totalCount
                nodes {
                  login
                  url
                  avatarUrl
                  ... on User {                    
                        email              
                      } 
                }
              }
              mergedBy {
                login
                url
                avatarUrl
                ... on User {                    
                      email              
                    }               
              }
              headRef {
                name
                target{
                  oid
                  commitUrl             
                }
              }
              baseRef {
                name
                target{
                  oid
                  commitUrl              
                }
              }
              commits(first:100) {
                totalCount
                nodes {
                  url
                  commit {
                    oid
                    message
                    authoredDate
                    author {
                      user {
                        login
                        url
                        avatarUrl
                        email
                      }
                    }
                  }
                }
              }
              reviews(first: 100) {
                totalCount
                nodes {
                  state
                  author {
                    login
                    url
                    avatarUrl
                    ... on User {                    
                      email              
                    }
                  }
                  body
                  submittedAt
                }
              }
              reviewRequests(first: 100) {
                totalCount
                nodes {
                  requestedReviewer {
                    __typename
                    ... on User {
                      login
                      url
                      email
                      avatarUrl
                    }
                    ... on Team {
                      name
                      slug
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;

    const variables = {
      owner: this.config.owner,
      repo: this.config.repository,
      cursor: cursor ? `${cursor}` : undefined,
    };

    const data = await this.graphql<any>(query, variables);
    const prs = data.repository.pullRequests.nodes;
    const hasNextPage = data.repository.pullRequests.pageInfo.hasNextPage;
    const endCursor = data.repository.pullRequests.pageInfo.endCursor;

    return { prs, hasNextPage, endCursor };
  }

  private mapPullRequest(pr: any): PullRequest {
    return {
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      mergedAt: pr.mergedAt,
      closedAt: pr.closedAt,
      createdBy: this.mapUser(pr.author),
      // assignee: this.mapUser(pr.assignee),
      mergedBy: this.mapUser(pr.mergedBy),
      head: this.mapBranch(pr.headRef),
      base: this.mapBranch(pr.baseRef),
      commits: pr.commits.map((commit: any) => this.mapCommit(commit)),
      reviews: pr.reviews.nodes.map((review: any) => this.mapReview(review)),
      reviewRequests: pr.reviewRequests.nodes.map((request: any) =>
        this.mapReviewRequest(request)
      ),
    };
  }

  private mapBranch(branch: any): PrBranch {
    return {
      // name: branch.name,
      // // commit: branch.commit.sha,
      // label: branch.label,
      // ref: branch.ref,
    };
  }

  private mapCommit(commit: any): Commit {
    return {
      sha: commit.sha,
      author: this.mapUser(commit.author),
      message: commit.message,
      url: commit.url,
      date: commit.date,
    };
  }

  private mapReview(review: any): Review {
    return {
      state: review.state,
      user: this.mapUser(review.user),
      body: review.body,
      submittedAt: review.submittedAt,
    };
  }

  private mapReviewRequest(request: any): ReviewRequest {
    if (request.requestedReviewer.__typename === "User") {
      return {
        requestedReviewer: this.mapUser(request.requestedReviewer),
      };
    } else if (request.requestedReviewer.__typename === "GithubTeam") {
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

  private mapUser(user: any): User {
    return {
      login: user.login,
      url: user.url,
      avatarUrl: user.avatarUrl,
    };
  }

  private mapRepository(repository: any): Repository {
    return {
      name: repository.name,
      fullName: repository.fullName,
      owner: this.mapUser(repository.owner),
      createdAt: repository.createdAt,
      updatedAt: repository.updatedAt,
      language: repository.language,
      description: repository.description,
    };
  }
}
