import { Branch } from "./Branch";
import { Commit } from "./Commit";
import { Review } from "./Review";
import { ReviewRequest } from "./ReviewRequest";
import { User } from "./User";

export type PullRequest = {
  number?: number;
  title?: string;
  body?: string;
  head?: Branch;
  base?: Branch;
  commits?: Commit[];
  createdAt?: string;
  updatedAt?: string;
  mergedAt?: string;
  closedAt?: string;
  state?: string;
  createdBy?: User;
  assignee?: User;
  mergedBy?: User;
  reviews?: Review[];
  reviewRequests?: ReviewRequest[];
};
