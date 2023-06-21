import { User } from "./User";

export type Comment = {
  author?: User;
  createdAt?: string;
  updatedAt?: string;
  body?: string;
  url?: string;
};
