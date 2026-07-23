import type { CoachConfidenceLabel } from "../models/CoachConfidence";
import { CoachConfidenceLabels } from "../models/CoachConfidence";

/**
 * Clamp confidence score to [0, 1].
 */
export function clampConfidence(score: number): number {
  if (!Number.isFinite(score)) {
    return 0.5;
  }
  if (score < 0) {
    return 0;
  }
  if (score > 1) {
    return 1;
  }
  return score;
}

/**
 * Map a numeric confidence score to a discrete label.
 */
export function labelForConfidence(score: number): CoachConfidenceLabel {
  const clamped = clampConfidence(score);
  if (clamped < 0.2) {
    return CoachConfidenceLabels.VERY_LOW;
  }
  if (clamped < 0.4) {
    return CoachConfidenceLabels.LOW;
  }
  if (clamped < 0.6) {
    return CoachConfidenceLabels.MEDIUM;
  }
  if (clamped < 0.8) {
    return CoachConfidenceLabels.HIGH;
  }
  return CoachConfidenceLabels.VERY_HIGH;
}

/**
 * Parse a confidence value from free text (e.g. "0.85", "85%", "high").
 */
export function parseConfidenceValue(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const percent = trimmed.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percent) {
    return clampConfidence(Number(percent[1]) / 100);
  }

  const numeric = trimmed.match(/(\d+(?:\.\d+)?)/);
  if (numeric) {
    const value = Number(numeric[1]);
    return clampConfidence(value > 1 ? value / 100 : value);
  }

  if (trimmed.includes("very high") || trimmed === "very_high") {
    return 0.9;
  }
  if (trimmed.includes("high")) {
    return 0.75;
  }
  if (trimmed.includes("medium") || trimmed.includes("moderate")) {
    return 0.5;
  }
  if (trimmed.includes("very low") || trimmed === "very_low") {
    return 0.1;
  }
  if (trimmed.includes("low")) {
    return 0.25;
  }

  return null;
}

export function isValidConfidence(score: number): boolean {
  return Number.isFinite(score) && score >= 0 && score <= 1;
}
