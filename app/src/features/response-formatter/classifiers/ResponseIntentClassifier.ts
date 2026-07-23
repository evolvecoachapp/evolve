import type { CoachResponseIntent } from "../models/CoachResponseIntent";
import { CoachResponseIntents } from "../models/CoachResponseIntent";
import type { CoachParsingResult } from "../models/CoachParsingResult";

/**
 * Provider-independent response intent classifier.
 */
export class ResponseIntentClassifier {
  classify(parsing: CoachParsingResult): CoachResponseIntent {
    const hasRecommendations = parsing.recommendationLines.length > 0;
    const hasWarnings = parsing.warningLines.length > 0;
    const hasActions = parsing.actionLines.length > 0;
    const hasQuestions = parsing.questionLines.length > 0;

    const flags = [
      hasRecommendations,
      hasWarnings,
      hasActions,
      hasQuestions,
    ].filter(Boolean).length;

    if (flags >= 2) {
      return CoachResponseIntents.MIXED;
    }
    if (hasWarnings) {
      return CoachResponseIntents.WARNING;
    }
    if (hasActions) {
      return CoachResponseIntents.ACTIONABLE;
    }
    if (hasRecommendations) {
      return CoachResponseIntents.RECOMMENDATION;
    }
    if (hasQuestions) {
      return CoachResponseIntents.QUESTION;
    }
    if (parsing.messageText.trim().length > 0) {
      return CoachResponseIntents.INFORMATIONAL;
    }
    return CoachResponseIntents.UNKNOWN;
  }
}

export const responseIntentClassifier = new ResponseIntentClassifier();
