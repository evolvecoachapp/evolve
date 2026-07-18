import { Decision } from "../../decision/models/Decision";
import { AthleteProfile } from "../../profile/models/AthleteProfile";

export interface SuggestionContext {
  decision: Decision;

  profile: AthleteProfile;
}
