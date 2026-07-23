import type { SleepLabel, SleepProfile } from "../models/SleepProfile";

export function sleepLabel(quality: number, hours: number): SleepLabel {
  const composite = quality * 0.7 + Math.min(100, (hours / 8) * 100) * 0.3;
  if (composite >= 80) return "excellent";
  if (composite >= 60) return "good";
  if (composite >= 40) return "fair";
  return "poor";
}

export function buildSleepProfile(
  hours: number,
  quality: number,
  notes: readonly string[] = [],
): SleepProfile {
  return Object.freeze({
    hours: Math.max(0, Math.min(24, hours)),
    quality: clamp(quality),
    label: sleepLabel(quality, hours),
    notes: Object.freeze([...notes]),
  });
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
