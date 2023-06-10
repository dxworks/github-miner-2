import { graphql } from "@octokit/graphql";

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

  async getPullRequests(cursor: number | null) {
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

    const data = await this.graphql<any>(query, variables);
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

    const data = await this.graphql<any>(query, variables);
    const issues = data.repository.issues.nodes;
    const hasNextPage = data.repository.issues.pageInfo.hasNextPage;
    const endCursor = data.repository.issues.pageInfo.endCursor;

    return { issues, hasNextPage, endCursor };
  }
}
