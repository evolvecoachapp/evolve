/**
 * Strategic AI output shape consumed by WorkoutBlueprintBuilder.
 *
 * All fields are optional/unknown-tolerant at the boundary — the builder
 * validates and normalizes. Never includes exercises, sets, reps, or RPE.
 */
export interface WorkoutBlueprintAIOutput {
  readonly id?: unknown;
  readonly split?: unknown;
  readonly priority?: unknown;
  readonly focus?: unknown;
  readonly constraints?: unknown;
  readonly blocks?: unknown;
  readonly days?: unknown;
  readonly weeklyFrequency?: unknown;
  readonly metadata?: unknown;
}
