import { RepositoryOwner } from "./RepositoryOwner";

export type Repository = {
  id?: string;
  name?: string;
  fullPath?: string;
  owner?: RepositoryOwner;
  createdAt?: string;
  updatedAt?: string;
  languages?: string[];
  description?: string;
};
