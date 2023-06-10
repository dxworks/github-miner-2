import { Repository } from "./Repository";
import { User } from "./User";

export type Branch = {
  name?: string;
  commit?: string;
  label?: string;
  ref?: string;
  user?: User;
  repo?: Repository;
};
