import { IssueComment } from "./IssueComment";
import { Label } from "./Label";
import { User } from "./User";

export type Issue = {
  number?: number;
  title?: string;
  body?: string;
  state?: string;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
  createdBy?: User;
  comments?: IssueComment[];
  assignees?: User[];
  labels?: Label[];
};
