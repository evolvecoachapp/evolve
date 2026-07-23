import type { StressLabel, StressProfile } from "../models/StressProfile";

export function stressLabel(level: number): StressLabel {
  if (level >= 80) return "severe";
  if (level >= 60) return "high";
  if (level >= 35) return "moderate";
  return "low";
}

export function buildStressProfile(
  level: number,
  notes: readonly string[] = [],
): StressProfile {
  return Object.freeze({
    level: clamp(level),
    label: stressLabel(level),
    notes: Object.freeze([...notes]),
  });
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
