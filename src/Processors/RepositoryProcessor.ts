import * as fs from "fs-extra";
import { GithubExtractor } from "../Extractors/GithubExtractor";
import { Repository } from "../types/Repository";
import { User } from "../types/User";
import { RepositoryOwner } from "../types/RepositoryOwner";

export class RepositoryProcessor {
  private extractor: GithubExtractor;

  constructor(extractor: GithubExtractor) {
    this.extractor = extractor;
  }

  async processRepositoryInfo() {
    const info: any = await this.extractor.getRepositoryInfo();

    const folderPath = "exports";
    const filePath = `${folderPath}/repositoryInfo.json`;

    // Create the "exports" folder if it doesn't exist
    await fs.ensureDir(folderPath);

    fs.writeFileSync(
      filePath,
      JSON.stringify(this.mapRepository(info.repositoryInfo))
    );

    console.log(`Stored ${info.name} repository info`);
  }

  private mapRepository(repository: any): Repository | null {
    return {
      id: repository.id,
      name: repository.name,
      fullPath: repository.resourcePath,
      owner: this.mapOwner(repository.owner),
      createdAt: repository.createdAt,
      updatedAt: repository.updatedAt,
      languages: repository.languages.nodes,
      description: repository.description,
    };
  }

  private mapOwner(owner: any): RepositoryOwner | undefined {
    if (!owner) return;

    return {
      name: owner.login,
      fullPath: owner.resourcePath,
      url: owner.url,
      avatarUrl: owner.avatarUrl,
    };
  }
}
