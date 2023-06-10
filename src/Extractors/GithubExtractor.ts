import { graphql } from "@octokit/graphql";
import { PullRequest } from "../types/PullRequest";
import { PrBranch } from "../types/PrBranch";
import { Commit } from "../types/Commit";
import { Repository } from "../types/Repository";
import { Review } from "../types/Review";
import { ReviewRequest } from "../types/ReviewRequest";
import { User } from "../types/User";

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
}
