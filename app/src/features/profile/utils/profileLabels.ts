import type { Gender, FitnessGoal } from "../../shared/models";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export const GOAL_OPTIONS: { value: FitnessGoal; label: string }[] = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "maintain_weight", label: "Maintain weight" },
  { value: "gain_muscle", label: "Gain muscle" },
  { value: "improve_endurance", label: "Improve endurance" },
  { value: "general_fitness", label: "General fitness" },
];

export function getGenderLabel(value: Gender | null | undefined): string {
  if (!value) {
    return "—";
  }
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function getGoalLabel(value: FitnessGoal | null | undefined): string {
  if (!value) {
    return "—";
  }
  return GOAL_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
