import { EquipmentType } from "../../enums/EquipmentType";
import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { SplitType } from "../../enums/SplitType";
import { TrainingGoal } from "../../enums/TrainingGoal";
import type { AthleteProfile } from "../AthleteProfile";
import { REPRESENTATIVE_CATALOGUE } from "./representativeCatalogue";

/** Beginner general-fitness athlete with 3 available days and a full-body preference. */
export const GENERAL_FITNESS_ATHLETE: AthleteProfile = {
  name: "General Fitness Foundation",
  description: "Beginner athlete building a consistent 8-week general fitness foundation.",
  goal: TrainingGoal.GeneralFitness,
  experienceLevel: ExperienceLevel.Beginner,
  durationWeeks: 8,
  availableDaysPerWeek: 3,
  availableEquipment: [
    EquipmentType.Barbell,
    EquipmentType.Dumbbell,
    EquipmentType.Cable,
    EquipmentType.Machine,
    EquipmentType.Bodyweight,
  ],
  exerciseCatalogue: REPRESENTATIVE_CATALOGUE,
  preferredSplitType: SplitType.FullBody,
  tags: ["fixture", "general-fitness", "sprint-12"],
  excludedExerciseIds: [],
};
