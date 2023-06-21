import { Octokit } from "@octokit/core";
import { throttling } from "@octokit/plugin-throttling";

type Config = {
  owner: string;
  repository: string;
  tokens: string[];
};

export class GithubExtractor {
  private config: Config;
  private octokitInstances: Octokit[];

  constructor(config: Config) {
    this.config = config;
    this.octokitInstances = [];
    const accessTokens = config.tokens;

    for (const token of accessTokens) {
      const MyOctokit = Octokit.plugin(throttling);
      const octokit = new MyOctokit({
        auth: token,
        throttle: {
          onRateLimit: async (
            retryAfter,
            options: any,
            octokit,
            retryCount
          ) => {
            octokit.log.warn(
              `Request quota exhausted for request ${options.method} ${options.url}`
            );

            if (options.request.retryCount === 0) {
              // Retry after a delay
              await this.retryAfterDelay(retryAfter);
            }
          },
          onSecondaryRateLimit: async (retryAfter, options: any, octokit) => {
            // does not retry, only logs a warning
            octokit.log.warn(
              `SecondaryRateLimit detected for request ${options.method} ${options.url}`
            );

            if (options.request.retryCount === 0) {
              // Retry after a delay
              await this.retryAfterDelay(retryAfter);
            }
          },
        },
      });

      // Retry on error statuses
      octokit.hook.error("request", async (error, options) => {
        if (options.request.retryCount === 0) {
          // Retry after a delay
          await this.retryAfterDelay();
          return octokit.request(options);
        }
        throw error;
      });

      this.octokitInstances.push(octokit);
    }
  }

  async getPullRequests(cursor: number | null) {
    const query = `
      query ($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 100, states: [OPEN, CLOSED, MERGED], after: $cursor) {
            nodes {
              number
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

    const octokit = this.getRandomOctokitInstance();
    const data = await octokit.graphql<any>(query, variables);
    const prs = data.repository.pullRequests.nodes;

    const prsDetailsPromises = prs.map(async (pr: { number: number }) => {
      const pullRequestNumber = pr.number;
      const pullRequestDetails = await this.getPullRequestDetails(
        pullRequestNumber
      );
      return pullRequestDetails;
    });

    const pullRequests = await Promise.all(prsDetailsPromises);

    const hasNextPage = data.repository.pullRequests.pageInfo.hasNextPage;
    const endCursor = data.repository.pullRequests.pageInfo.endCursor;

    return { pullRequests, hasNextPage, endCursor };
  }

  async getPullRequestDetails(pullRequestNumber: number) {
    const query = `query ($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {          
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
                email                               
              }
            }
            labels (first: 100) {
              totalCount
              nodes {
                name
                description
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
            changedFiles
            commits(first:100) {
              totalCount
              nodes {
                url              
                commit {
                  oid
                  message
                  changedFilesIfAvailable
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
            comments (first: 100) {
              totalCount
              nodes {
                author {
                  login
                  url
                  avatarUrl
                  ... on User {                    
                        email              
                      }
                }
                createdAt
                updatedAt
                body
                url
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
                comments(first: 100) {
                  totalCount                
                  nodes {
                    author {
                      login
                      url
                      avatarUrl
                      ... on User {                    
                            email              
                          }
                    }
                    createdAt
                    updatedAt
                    body
                    url
                  }
                }              
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
        }
      }
    `;

    const variables = {
      owner: this.config.owner,
      repo: this.config.repository,
      number: pullRequestNumber,
    };

    const octokit = this.getRandomOctokitInstance();
    const data = await octokit.graphql<any>(query, variables);
    const pullRequestDetails = data.repository.pullRequest;

    return pullRequestDetails;
  }

  async getRepositoryInfo() {
    const query = `
      query ($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id
          name
          resourcePath
          owner {
            login
            url
            avatarUrl
          }
          createdAt
          updatedAt
          languages (first: 100) {
            totalCount
            nodes {
              name
            }
          }
          description
        }
      }
    `;

    const variables = {
      owner: this.config.owner,
      repo: this.config.repository,
    };

    const octokit = this.getRandomOctokitInstance();
    const data = await octokit.graphql<any>(query, variables);
    const repositoryInfo = data.repository;

    return { repositoryInfo };
  }

  async getIssues(cursor: number | null) {
    const query = `
      query ($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          issues(first: 100, after: $cursor) {
            nodes {
              number
              title
              body
              state
              createdAt
              updatedAt
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
                  email                          
                }
              }
              labels (first: 100) {
                totalCount
                nodes {
                  name
                  description
                }
              }
              comments (first: 100) {
                totalCount
                nodes {
                  author {
                    login
                    url
                    avatarUrl
                    ... on User {                    
                          email              
                        }
                  }
                  createdAt
                  updatedAt
                  body
                  url
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

    const octokit = this.getRandomOctokitInstance();
    const data = await octokit.graphql<any>(query, variables);
    const issues = data.repository.issues.nodes;
    const hasNextPage = data.repository.issues.pageInfo.hasNextPage;
    const endCursor = data.repository.issues.pageInfo.endCursor;

    return { issues, hasNextPage, endCursor };
  }

  private getRandomOctokitInstance() {
    return this.octokitInstances[
      Math.floor(Math.random() * this.octokitInstances.length)
    ];
  }

  private retryAfterDelay(delay: number = 60) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay * 1000);
    });
  }

  private shouldRetryOnErrorStatus(status: number) {
    // Add additional error status codes to retry if needed
    const retryErrorStatusCodes = [502, 503, 504];
    return retryErrorStatusCodes.includes(status);
  }
}
