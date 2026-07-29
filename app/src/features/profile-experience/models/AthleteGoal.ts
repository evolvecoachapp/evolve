export const GoalKindValues = {
  STRENGTH: "strength",
  ENDURANCE: "endurance",
  WEIGHT_LOSS: "weight_loss",
  MUSCLE_GAIN: "muscle_gain",
  FLEXIBILITY: "flexibility",
  GENERAL_FITNESS: "general_fitness",
  SPORT_SPECIFIC: "sport_specific",
} as const;

export type GoalKind = (typeof GoalKindValues)[keyof typeof GoalKindValues];

export interface AthleteGoal {
  readonly id: string;
  readonly kind: GoalKind;
  readonly title: string;
  readonly description: string;
  readonly targetDate: string | null;
  readonly progress: number;
  readonly isPrimary: boolean;
  readonly destination: string | null;
}

export function createAthleteGoal(input: AthleteGoal): AthleteGoal {
  return Object.freeze({ ...input });
}
