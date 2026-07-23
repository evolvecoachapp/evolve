/**
 * Named pipeline stages. Each stage has one responsibility.
 */
export const AIExecutionStages = {
  VALIDATION: "validation",
  CONTEXT: "context",
  PROVIDER_RESOLUTION: "provider_resolution",
  EXECUTION: "execution",
  RESULT: "result",
  LIFECYCLE: "lifecycle",
} as const;

export type AIExecutionStage =
  (typeof AIExecutionStages)[keyof typeof AIExecutionStages];

export const AIExecutionStageOrder: readonly AIExecutionStage[] = Object.freeze([
  AIExecutionStages.VALIDATION,
  AIExecutionStages.CONTEXT,
  AIExecutionStages.PROVIDER_RESOLUTION,
  AIExecutionStages.EXECUTION,
  AIExecutionStages.RESULT,
  AIExecutionStages.LIFECYCLE,
]);
