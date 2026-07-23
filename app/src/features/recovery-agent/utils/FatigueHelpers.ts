import type { FatigueLabel, FatigueState } from "../models/FatigueState";

export function fatigueLabel(level: number): FatigueLabel {
  if (level >= 80) return "severe";
  if (level >= 60) return "high";
  if (level >= 35) return "moderate";
  return "low";
}

export function buildFatigueState(
  level: number,
  notes: readonly string[] = [],
): FatigueState {
  return Object.freeze({
    level: clamp(level),
    label: fatigueLabel(level),
    notes: Object.freeze([...notes]),
  });
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
