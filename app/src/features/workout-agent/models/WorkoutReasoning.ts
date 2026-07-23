/**
 * Deterministic reasoning fragment produced by reasoners (no AI).
 */
export interface WorkoutReasoning {
  readonly id: string;
  readonly topic: WorkoutReasoningTopic;
  readonly findings: readonly string[];
  readonly signals: Readonly<Record<string, number>>;
  readonly notes: readonly string[];
}

export type WorkoutReasoningTopic =
  | "exercise"
  | "progression"
  | "volume"
  | "intensity"
  | "fatigue"
  | "frequency"
  | "split"
  | "goal";

export const WorkoutReasoningTopics = Object.freeze({
  EXERCISE: "exercise" as const,
  PROGRESSION: "progression" as const,
  VOLUME: "volume" as const,
  INTENSITY: "intensity" as const,
  FATIGUE: "fatigue" as const,
  FREQUENCY: "frequency" as const,
  SPLIT: "split" as const,
  GOAL: "goal" as const,
});
