import { AthleteGoal } from "./AthleteGoal";
import { DeadliftStyle } from "./DeadliftStyle";
import { ExperienceLevel } from "./ExperienceLevel";
import { SquatStyle } from "./SquatStyle";

export interface AthleteProfile {
  goal: AthleteGoal;

  squatStyle: SquatStyle;

  deadliftStyle: DeadliftStyle;

  experience: ExperienceLevel;

  preferences: string[];

  limitations: string[];
}
