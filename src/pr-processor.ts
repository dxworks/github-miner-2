import * as fs from "fs";
import { GithubExtractor } from "./github-extractor";

export class PRsProcessor {
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

    fs.writeFileSync("prs.json", JSON.stringify(allPRs));
    console.log(`Stored ${allPRs.length} pull requests in prs.json`);
  }
}
