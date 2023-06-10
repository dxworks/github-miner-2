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

  async getPRs(cursor: number | null) {
    const query = `
      query($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          pullRequests(first: 100, states: [OPEN, CLOSED, MERGED], after: $cursor) {
            nodes {
              number
              title
              state
              createdAt
              updatedAt
              mergedAt
              mergedBy {
                login
              }
              author {
                login
              }
              files {
                totalCount
              }
              comments {
                totalCount
              }
              reviewRequests {
                totalCount
              }
              reviews(first: 100) {
                totalCount
                nodes {
                  author {
                    login
                  }
                  state
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
    console.log(prs);
    const hasNextPage = data.repository.pullRequests.pageInfo.hasNextPage;
    const endCursor = data.repository.pullRequests.pageInfo.endCursor;

    return { prs, hasNextPage, endCursor };
  }
}
