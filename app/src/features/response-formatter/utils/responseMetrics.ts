import type { CoachResponse } from "../models/CoachResponse";
import type { CoachResponseStatistics } from "../models/CoachResponseStatistics";
import { computeResponseStatistics } from "./responseStatistics";

/**
 * Lightweight metrics derived from a coach response.
 */
export interface ResponseMetrics {
  readonly responseId: string;
  readonly hasWarnings: boolean;
  readonly hasActions: boolean;
  readonly hasRecommendations: boolean;
  readonly isActionable: boolean;
  readonly completenessRatio: number;
  readonly statistics: CoachResponseStatistics;
}

export function computeResponseMetrics(
  response: CoachResponse,
): ResponseMetrics {
  const statistics = computeResponseStatistics(response);
  const signals = [
    response.message.text.trim().length > 0,
    statistics.recommendationCount > 0,
    statistics.warningCount > 0,
    statistics.actionCount > 0,
    statistics.insightCount > 0,
    statistics.questionCount > 0,
    statistics.citationCount > 0,
    response.confidence.score > 0,
  ];
  const present = signals.filter(Boolean).length;

  return Object.freeze({
    responseId: response.id,
    hasWarnings: statistics.warningCount > 0,
    hasActions: statistics.actionCount > 0,
    hasRecommendations: statistics.recommendationCount > 0,
    isActionable: statistics.actionCount > 0 || statistics.questionCount > 0,
    completenessRatio: present / signals.length,
    statistics,
  });
}
