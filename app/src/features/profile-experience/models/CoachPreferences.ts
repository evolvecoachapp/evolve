export const CoachingStyleValues = {
  SUPPORTIVE: "supportive",
  DIRECTIVE: "directive",
  ANALYTICAL: "analytical",
  MOTIVATIONAL: "motivational",
} as const;

export type CoachingStyle = (typeof CoachingStyleValues)[keyof typeof CoachingStyleValues];

export const MotivationLevelValues = {
  LOW: "low",
  MODERATE: "moderate",
  HIGH: "high",
  INTENSE: "intense",
} as const;

export type MotivationLevel = (typeof MotivationLevelValues)[keyof typeof MotivationLevelValues];

export const FeedbackFrequencyValues = {
  MINIMAL: "minimal",
  REGULAR: "regular",
  FREQUENT: "frequent",
  CONSTANT: "constant",
} as const;

export type FeedbackFrequency = (typeof FeedbackFrequencyValues)[keyof typeof FeedbackFrequencyValues];

export const ExplanationDepthValues = {
  BRIEF: "brief",
  MODERATE: "moderate",
  DETAILED: "detailed",
  COMPREHENSIVE: "comprehensive",
} as const;

export type ExplanationDepth = (typeof ExplanationDepthValues)[keyof typeof ExplanationDepthValues];

export interface CoachPreferences {
  readonly coachingStyle: CoachingStyle;
  readonly motivationLevel: MotivationLevel;
  readonly feedbackFrequency: FeedbackFrequency;
  readonly explanationDepth: ExplanationDepth;
  readonly destination: string | null;
}

export function createCoachPreferences(input: CoachPreferences): CoachPreferences {
  return Object.freeze({ ...input });
}
