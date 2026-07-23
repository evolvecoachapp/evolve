import type { CoachResponse } from "../models/CoachResponse";
import type { CoachResponseStatistics } from "../models/CoachResponseStatistics";
import { freezeStatistics } from "./freezeObjects";
import { countWords } from "./formattingHelpers";

/**
 * Compute immutable statistics for a CoachResponse.
 */
export function computeResponseStatistics(
  response: CoachResponse,
): CoachResponseStatistics {
  const text = [
    response.message.text,
    response.reasoning ?? "",
    ...response.recommendations.map((r) => r.text),
    ...response.warnings.map((w) => w.text),
    ...response.insights.map((i) => i.text),
    ...response.actions.map((a) => a.label),
    ...response.exercises.map((e) => e.name),
    ...response.nutrition.map((n) => n.text),
    ...response.recovery.map((r) => r.text),
    ...response.questions.map((q) => q.text),
    ...response.citations.map((c) => c.title),
    ...response.sections.map((s) => s.content),
  ].join(" ");

  return freezeStatistics({
    characterCount: text.length,
    wordCount: countWords(text),
    sectionCount: response.sections.length,
    recommendationCount: response.recommendations.length,
    warningCount: response.warnings.length,
    actionCount: response.actions.length,
    exerciseCount: response.exercises.length,
    nutritionCount: response.nutrition.length,
    recoveryCount: response.recovery.length,
    questionCount: response.questions.length,
    citationCount: response.citations.length,
    insightCount: response.insights.length,
  });
}
