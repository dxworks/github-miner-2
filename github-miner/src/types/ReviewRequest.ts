import { GithubTeam } from "./GithubTeam";
import { User } from "./User";

export type ReviewRequest = {
  requestedReviewer?: User | GithubTeam;
};
