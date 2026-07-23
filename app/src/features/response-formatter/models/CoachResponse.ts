import type { CoachAction } from "./CoachAction";
import type { CoachCitation } from "./CoachCitation";
import type { CoachConfidence } from "./CoachConfidence";
import type { CoachExercise } from "./CoachExercise";
import type { CoachFormatting } from "./CoachFormatting";
import type { CoachInsight } from "./CoachInsight";
import type { CoachMessage } from "./CoachMessage";
import type { CoachMetadata } from "./CoachMetadata";
import type { CoachNutritionAdvice } from "./CoachNutritionAdvice";
import type { CoachQuestion } from "./CoachQuestion";
import type { CoachRecommendation } from "./CoachRecommendation";
import type { CoachRecoveryAdvice } from "./CoachRecoveryAdvice";
import type { CoachResponseIntent } from "./CoachResponseIntent";
import type { CoachSection } from "./CoachSection";
import type { CoachWarning } from "./CoachWarning";

/**
 * Immutable structured coach response produced from an AIResponse.
 *
 * Provider-independent. No UI. No persistence. No business logic.
 */
export interface CoachResponse {
  readonly id: string;
  readonly sourceResponseId: string;
  readonly message: CoachMessage;
  readonly intent: CoachResponseIntent;
  readonly recommendations: readonly CoachRecommendation[];
  readonly warnings: readonly CoachWarning[];
  readonly insights: readonly CoachInsight[];
  readonly actions: readonly CoachAction[];
  readonly exercises: readonly CoachExercise[];
  readonly nutrition: readonly CoachNutritionAdvice[];
  readonly recovery: readonly CoachRecoveryAdvice[];
  readonly questions: readonly CoachQuestion[];
  readonly citations: readonly CoachCitation[];
  readonly sections: readonly CoachSection[];
  readonly confidence: CoachConfidence;
  readonly formatting: CoachFormatting;
  readonly metadata: CoachMetadata;
  readonly reasoning: string | null;
  readonly createdAt: string;
  readonly frozenAt: string;
}
