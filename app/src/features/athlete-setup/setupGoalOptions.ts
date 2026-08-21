import type { Goal } from "../../types/api";

export interface SetupGoalOption {
  readonly value: Goal;
  readonly label: string;
  readonly description: string;
}

export const SETUP_GOAL_OPTIONS: readonly SetupGoalOption[] = [
  {
    value: "lose_weight",
    label: "Cut with intent",
    description: "Lose fat while staying strong and recovered.",
  },
  {
    value: "gain_muscle",
    label: "Build muscle",
    description: "Add lean mass with progressive training.",
  },
  {
    value: "improve_endurance",
    label: "Build the engine",
    description: "Last longer, recover faster between efforts.",
  },
  {
    value: "maintain_weight",
    label: "Stay sharp",
    description: "Hold this physique and keep performing.",
  },
  {
    value: "general_fitness",
    label: "All-around fitness",
    description: "Feel strong, capable, and consistent.",
  },
];

export function getSetupGoalLabel(value: Goal | null | undefined): string {
  if (!value) {
    return "—";
  }
  return SETUP_GOAL_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
