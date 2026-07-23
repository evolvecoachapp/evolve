import type { AggregationResult } from "../models/AggregationResult";
import type { CoachSupervisorValidation } from "../models/CoachSupervisorValidation";
import { applyAggregationPolicy } from "../policies/AggregationPolicy";

export function validateAggregationIntegrity(
  result: AggregationResult,
): CoachSupervisorValidation {
  return applyAggregationPolicy(result);
}
