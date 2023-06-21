import { Comment } from "./Comment";
import { User } from "./User";

export type Review = {
  state?: string;
  user?: User;
  body?: string;
  submittedAt?: string;
  comments?: Comment[];
};
