export type CoachTone = "motivational" | "direct" | "supportive" | "technical";

export type CoachResponseLength = "concise" | "balanced" | "detailed";

/** Coach AI interaction and context-sharing preferences. */
export interface CoachPreferences {
  tone: CoachTone;
  responseLength: CoachResponseLength;
  enableStreaming: boolean;
  includeWorkoutContext: boolean;
  includeNutritionContext: boolean;
  includeRecoveryContext: boolean;
  includeProgressContext: boolean;
  proactiveCheckIns: boolean;
}
