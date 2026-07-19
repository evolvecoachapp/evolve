import { EquipmentType } from "../../enums/EquipmentType";
import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { SplitType } from "../../enums/SplitType";
import { TrainingGoal } from "../../enums/TrainingGoal";
import type { AthleteProfile } from "../AthleteProfile";
import { REPRESENTATIVE_CATALOGUE } from "./representativeCatalogue";

/** Intermediate hypertrophy athlete with 5 available days and a push/pull/legs preference. */
export const HYPERTROPHY_ATHLETE: AthleteProfile = {
  name: "Hypertrophy Accumulation Block",
  description: "Intermediate physique athlete running a 10-week hypertrophy accumulation phase.",
  goal: TrainingGoal.Hypertrophy,
  experienceLevel: ExperienceLevel.Intermediate,
  durationWeeks: 10,
  availableDaysPerWeek: 5,
  availableEquipment: [
    EquipmentType.Barbell,
    EquipmentType.Dumbbell,
    EquipmentType.Cable,
    EquipmentType.Machine,
    EquipmentType.Bodyweight,
  ],
  exerciseCatalogue: REPRESENTATIVE_CATALOGUE,
  preferredSplitType: SplitType.PushPullLegs,
  tags: ["fixture", "hypertrophy", "sprint-12"],
  excludedExerciseIds: [],
};
