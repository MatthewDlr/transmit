import { UserProfile } from "../../../shared/types/Profile.type";

export interface UserSuggestion extends UserProfile {
  friendsInCommon?: number;
}
