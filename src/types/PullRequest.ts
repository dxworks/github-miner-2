import { PrBranch } from "./PrBranch";
import { Commit } from "./Commit";
import { Review } from "./Review";
import { ReviewRequest } from "./ReviewRequest";
import { User } from "./User";

export type PullRequest = {
  number?: number;
  title?: string;
  body?: string;
  head?: PrBranch;
  base?: PrBranch;
  commits?: Commit[];
  createdAt?: string;
  updatedAt?: string;
  mergedAt?: string;
  closedAt?: string;
  state?: string;
  createdBy?: User;
  assignees?: User[];
  mergedBy?: User;
  reviews?: Review[];
  reviewRequests?: ReviewRequest[];
};
