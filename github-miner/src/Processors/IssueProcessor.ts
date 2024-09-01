import { GithubExtractor } from "../Extractors/GithubExtractor";
import * as fs from "fs-extra";
import { Issue } from "../types/Issue";
import { User } from "../types/User";
import { Label } from "../types/Label";
import { Comment } from "../types/Comment";

export class IssueProcessor {
  private extractor: GithubExtractor;

  constructor(extractor: GithubExtractor) {
    this.extractor = extractor;
  }

  async processIssues() {
    let allIssues: any[] = [];
    let hasNextPage = true;
    let cursor = null;

    while (hasNextPage) {
      const issues: any = await this.extractor.getIssues(cursor);
      allIssues = allIssues.concat(issues.issues);
      await this.writeToFile(allIssues);

      console.log(
        `Processed ${issues.issues.length} issues ${issues.endCursor}`
      );

      const lastIssue = issues.issues[issues.issues.length - 1];

      if (lastIssue) {
        cursor = issues.endCursor;
      }

      if (!issues.hasNextPage) break;
    }

    console.log(`Stored ${allIssues.length} issues in exports/issues.json`);
  }

  private async writeToFile(allIssues: any) {
    const folderPath = "exports";
    const filePath = `${folderPath}/issues.json`;

    // Create the "exports" folder if it doesn't exist
    await fs.ensureDir(folderPath);

    fs.writeFileSync(
      filePath,
      JSON.stringify(allIssues.map((issue: any) => this.mapIssue(issue)))
    );
  }

  private mapIssue(issue: any): Issue | undefined {
    if (!issue) return;

    return {
      number: issue.number,
      title: issue.number,
      body: issue.body,
      state: issue.state,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      closedAt: issue.closedAt,
      createdBy: this.mapUser(issue.createdBy),
      comments: issue.comments.nodes.map((comment: any) =>
        this.mapIssueComment(comment)
      ),
      assignees: issue.assignees.nodes.map((assignee: any) =>
        this.mapUser(assignee)
      ),
      labels: issue.labels.nodes.map((label: any) => this.mapLabel(label)),
    };
  }

  private mapIssueComment(comment: any): Comment | undefined {
    if (!comment) return;

    return {
      author: this.mapUser(comment.author),
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      body: comment.body,
      url: comment.url,
    };
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

  private mapLabel(label: any): Label | undefined {
    if (!label) return;

    return {
      name: label.name,
      description: label.description,
    };
  }
}
