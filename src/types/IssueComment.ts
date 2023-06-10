import { User } from "./User";

export type IssueComment = {
  author?: User;
  createdAt?: string;
  updatedAt?: string;
  body?: string;
  url?: string;
};
