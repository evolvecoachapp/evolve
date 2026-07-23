import type { CoachAction } from "../models/CoachAction";
import type { CoachCitation } from "../models/CoachCitation";
import type { CoachConfidence } from "../models/CoachConfidence";
import type { CoachExercise } from "../models/CoachExercise";
import type { CoachFormatting } from "../models/CoachFormatting";
import type { CoachFormattingResult } from "../models/CoachFormattingResult";
import type { CoachInsight } from "../models/CoachInsight";
import type { CoachMessage } from "../models/CoachMessage";
import type { CoachMetadata } from "../models/CoachMetadata";
import type { CoachNutritionAdvice } from "../models/CoachNutritionAdvice";
import type { CoachParsingResult } from "../models/CoachParsingResult";
import type { CoachQuestion } from "../models/CoachQuestion";
import type { CoachRecommendation } from "../models/CoachRecommendation";
import type { CoachRecoveryAdvice } from "../models/CoachRecoveryAdvice";
import type { CoachResponse } from "../models/CoachResponse";
import type { CoachResponsePackage } from "../models/CoachResponsePackage";
import type { CoachResponseSnapshot } from "../models/CoachResponseSnapshot";
import type { CoachResponseStatistics } from "../models/CoachResponseStatistics";
import type { CoachSection } from "../models/CoachSection";
import type { CoachSummary } from "../models/CoachSummary";
import type { CoachValidationIssue } from "../models/CoachValidationIssue";
import type { CoachWarning } from "../models/CoachWarning";

export function freezeMessage(message: CoachMessage): CoachMessage {
  return Object.freeze({ ...message });
}

export function freezeConfidence(
  confidence: CoachConfidence,
): CoachConfidence {
  return Object.freeze({ ...confidence });
}

export function freezeFormatting(
  formatting: CoachFormatting,
): CoachFormatting {
  return Object.freeze({ ...formatting });
}

export function freezeMetadata(metadata: CoachMetadata): CoachMetadata {
  return Object.freeze({
    ...metadata,
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeRecommendation(
  item: CoachRecommendation,
): CoachRecommendation {
  return Object.freeze({ ...item });
}

export function freezeWarning(item: CoachWarning): CoachWarning {
  return Object.freeze({ ...item });
}

export function freezeInsight(item: CoachInsight): CoachInsight {
  return Object.freeze({ ...item });
}

export function freezeAction(item: CoachAction): CoachAction {
  return Object.freeze({
    ...item,
    payload: Object.freeze({ ...item.payload }),
  });
}

export function freezeExercise(item: CoachExercise): CoachExercise {
  return Object.freeze({ ...item });
}

export function freezeNutrition(
  item: CoachNutritionAdvice,
): CoachNutritionAdvice {
  return Object.freeze({ ...item });
}

export function freezeRecovery(
  item: CoachRecoveryAdvice,
): CoachRecoveryAdvice {
  return Object.freeze({ ...item });
}

export function freezeQuestion(item: CoachQuestion): CoachQuestion {
  return Object.freeze({ ...item });
}

export function freezeCitation(item: CoachCitation): CoachCitation {
  return Object.freeze({ ...item });
}

export function freezeSection(item: CoachSection): CoachSection {
  return Object.freeze({ ...item });
}

export function freezeStatistics(
  stats: CoachResponseStatistics,
): CoachResponseStatistics {
  return Object.freeze({ ...stats });
}

export function freezeSummary(summary: CoachSummary): CoachSummary {
  return Object.freeze({ ...summary });
}

export function freezeValidationIssue(
  issue: CoachValidationIssue,
): CoachValidationIssue {
  return Object.freeze({ ...issue });
}

/**
 * Deep-freeze an immutable CoachResponse.
 */
export function freezeResponse(response: CoachResponse): CoachResponse {
  return Object.freeze({
    ...response,
    message: freezeMessage(response.message),
    recommendations: Object.freeze(
      response.recommendations.map(freezeRecommendation),
    ),
    warnings: Object.freeze(response.warnings.map(freezeWarning)),
    insights: Object.freeze(response.insights.map(freezeInsight)),
    actions: Object.freeze(response.actions.map(freezeAction)),
    exercises: Object.freeze(response.exercises.map(freezeExercise)),
    nutrition: Object.freeze(response.nutrition.map(freezeNutrition)),
    recovery: Object.freeze(response.recovery.map(freezeRecovery)),
    questions: Object.freeze(response.questions.map(freezeQuestion)),
    citations: Object.freeze(response.citations.map(freezeCitation)),
    sections: Object.freeze(response.sections.map(freezeSection)),
    confidence: freezeConfidence(response.confidence),
    formatting: freezeFormatting(response.formatting),
    metadata: freezeMetadata(response.metadata),
  });
}

export function freezeParsingResult(
  parsing: CoachParsingResult,
): CoachParsingResult {
  return Object.freeze({
    ...parsing,
    recommendationLines: Object.freeze([...parsing.recommendationLines]),
    warningLines: Object.freeze([...parsing.warningLines]),
    actionLines: Object.freeze([...parsing.actionLines]),
    exerciseLines: Object.freeze([...parsing.exerciseLines]),
    nutritionLines: Object.freeze([...parsing.nutritionLines]),
    recoveryLines: Object.freeze([...parsing.recoveryLines]),
    questionLines: Object.freeze([...parsing.questionLines]),
    citationLines: Object.freeze([...parsing.citationLines]),
    insightLines: Object.freeze([...parsing.insightLines]),
    sections: Object.freeze(parsing.sections.map(freezeSection)),
  });
}

export function freezeFormattingResult(
  result: CoachFormattingResult,
): CoachFormattingResult {
  return Object.freeze({
    ...result,
    sections: Object.freeze({ ...result.sections }),
    response: freezeResponse(result.response),
  });
}

export function freezeSnapshot(
  snapshot: CoachResponseSnapshot,
): CoachResponseSnapshot {
  return Object.freeze({
    response: freezeResponse(snapshot.response),
    summary: freezeSummary(snapshot.summary),
    statistics: freezeStatistics(snapshot.statistics),
    capturedAt: snapshot.capturedAt,
  });
}

export function freezePackage(
  pkg: CoachResponsePackage,
): CoachResponsePackage {
  return Object.freeze({
    response: freezeResponse(pkg.response),
    parsing: freezeParsingResult(pkg.parsing),
    snapshot: freezeSnapshot(pkg.snapshot),
    formatting: pkg.formatting
      ? freezeFormattingResult(pkg.formatting)
      : null,
    validationIssues: Object.freeze(
      pkg.validationIssues.map(freezeValidationIssue),
    ),
    createdAt: pkg.createdAt,
  });
}
