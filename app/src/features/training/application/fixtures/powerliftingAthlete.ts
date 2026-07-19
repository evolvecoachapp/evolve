import { EquipmentType } from "../../enums/EquipmentType";
import { ExperienceLevel } from "../../enums/ExperienceLevel";
import { SplitType } from "../../enums/SplitType";
import { TrainingGoal } from "../../enums/TrainingGoal";
import type { AthleteProfile } from "../AthleteProfile";
import { REPRESENTATIVE_CATALOGUE } from "./representativeCatalogue";

/** Intermediate powerlifter with 4 available training days and a strength-biased split preference. */
export const POWERLIFTING_ATHLETE: AthleteProfile = {
  name: "Powerlifting Strength Block",
  description: "Intermediate powerlifter preparing a 12-week strength block around the competition lifts.",
  goal: TrainingGoal.Powerlifting,
  experienceLevel: ExperienceLevel.Intermediate,
  durationWeeks: 12,
  availableDaysPerWeek: 4,
  availableEquipment: [
    EquipmentType.Barbell,
    EquipmentType.Dumbbell,
    EquipmentType.Cable,
    EquipmentType.Machine,
    EquipmentType.Bodyweight,
  ],
  exerciseCatalogue: REPRESENTATIVE_CATALOGUE,
  preferredSplitType: SplitType.PowerliftingSpecialized,
  tags: ["fixture", "powerlifting", "sprint-12"],
  excludedExerciseIds: [],
};
