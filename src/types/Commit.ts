import { User } from "./User";

export type Commit = {
  sha?: string;
  author?: User;
  message?: string;
  url?: string;
  date?: string;
};
