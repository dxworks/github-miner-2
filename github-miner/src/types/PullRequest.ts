import { PrBranch } from "./PrBranch";
import { Commit } from "./Commit";
import { Review } from "./Review";
import { ReviewRequest } from "./ReviewRequest";
import { User } from "./User";
import { Comment } from "./Comment";

export type PullRequest = {
  number?: number;
  title?: string;
  body?: string;
  head?: PrBranch;
  base?: PrBranch;
  changedFiles?: number;
  commits?: Commit[];
  createdAt?: string;
  updatedAt?: string;
  mergedAt?: string;
  closedAt?: string;
  state?: string;
  createdBy?: User;
  comments?: Comment[];
  assignees?: User[];
  labels?: string[];
  mergedBy?: User;
  reviews?: Review[];
  reviewRequests?: ReviewRequest[];
};
