import type { HydrationPlan } from "../models/HydrationPlan";

export function buildHydrationPlan(bodyWeightKg: number): HydrationPlan {
  const liters = Math.round(Math.max(2, bodyWeightKg * 0.035) * 10) / 10;
  return Object.freeze({
    litersPerDay: liters,
    notes: Object.freeze([
      "Sip fluids evenly across the day.",
      "Increase intake around training.",
    ]),
  });
}
