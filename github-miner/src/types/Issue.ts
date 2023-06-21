import { Comment } from "./Comment";
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
  comments?: Comment[];
  assignees?: User[];
  labels?: Label[];
};
