import { User } from "./User";

export type Repository = {
  name?: string;
  fullName?: string;
  owner?: User;
  createdAt?: string;
  updatedAt?: string;
  language?: string;
  description?: string;
};
