import type { AggregationResult } from "../models/AggregationResult";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

export function applyAggregationPolicy(
  result: AggregationResult,
): CoachSupervisorValidation {
  const issues = [];
  if (result.summaries.length === 0) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_AGGREGATION,
      message: "Aggregation has no summaries.",
      path: "summaries",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
