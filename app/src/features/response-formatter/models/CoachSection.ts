/**
 * Immutable named content section within a coach response.
 */
export interface CoachSection {
  readonly id: string;
  readonly title: string;
  readonly kind: CoachSectionKind;
  readonly content: string;
  readonly order: number;
}

export type CoachSectionKind =
  | "message"
  | "recommendations"
  | "warnings"
  | "actions"
  | "exercises"
  | "nutrition"
  | "recovery"
  | "questions"
  | "citations"
  | "insights"
  | "reasoning"
  | "confidence"
  | "other";

export const CoachSectionKinds = Object.freeze({
  MESSAGE: "message" as const,
  RECOMMENDATIONS: "recommendations" as const,
  WARNINGS: "warnings" as const,
  ACTIONS: "actions" as const,
  EXERCISES: "exercises" as const,
  NUTRITION: "nutrition" as const,
  RECOVERY: "recovery" as const,
  QUESTIONS: "questions" as const,
  CITATIONS: "citations" as const,
  INSIGHTS: "insights" as const,
  REASONING: "reasoning" as const,
  CONFIDENCE: "confidence" as const,
  OTHER: "other" as const,
});
