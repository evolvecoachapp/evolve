import { Decision } from "../../decision/models/Decision";
import { CoachProfile } from "../../profile/models/CoachProfile";

export interface CoachResponse {
  message: string;

  decision: Decision;

  suggestions: string[];

  profile: CoachProfile;
}
