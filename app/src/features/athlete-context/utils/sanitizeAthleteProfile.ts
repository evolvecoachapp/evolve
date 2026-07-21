import type { AthleteProfile } from "../models/AthleteProfile";
import type { EquipmentItem } from "../models/EquipmentProfile";
import type { InjuryEntry } from "../models/InjuryProfile";

/**
 * Sanitize an athlete profile for safe storage / consumption.
 *
 * Trims strings, drops empty injury entries, and deduplicates equipment.
 * Does not format for display.
 */
export function sanitizeAthleteProfile(
  profile: AthleteProfile,
): AthleteProfile {
  const displayName =
    profile.displayName === null
      ? null
      : profile.displayName.trim().length === 0
        ? null
        : profile.displayName.trim();

  const available = dedupeEquipment(
    profile.equipment.available.map((item) => item),
  );

  const injuries = Object.freeze(
    profile.injuries.injuries
      .map(sanitizeInjury)
      .filter((entry): entry is InjuryEntry => entry !== null),
  );

  const preferredDays = Object.freeze(
    Array.from(new Set(profile.availability.preferredDays)).sort(
      (left, right) => left - right,
    ),
  );

  return Object.freeze({
    id: profile.id.trim(),
    displayName,
    ageYears: profile.ageYears,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    goal: Object.freeze({
      primary: profile.goal.primary,
      secondary: profile.goal.secondary,
      targetDate: profile.goal.targetDate,
    }),
    experience: Object.freeze({
      level: profile.experience.level,
      trainingStartedAt: profile.experience.trainingStartedAt,
      yearsTraining: profile.experience.yearsTraining,
    }),
    availability: Object.freeze({
      daysPerWeek: profile.availability.daysPerWeek,
      sessionDurationMinutes: profile.availability.sessionDurationMinutes,
      preferredDays,
    }),
    preference: Object.freeze({
      preferredSplit: profile.preference.preferredSplit,
      prefersCompoundLifts: profile.preference.prefersCompoundLifts,
      intensityBias: profile.preference.intensityBias,
    }),
    equipment: Object.freeze({
      available,
      hasFullGymAccess: profile.equipment.hasFullGymAccess,
    }),
    injuries: Object.freeze({
      injuries,
    }),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  });
}

function sanitizeInjury(entry: InjuryEntry): InjuryEntry | null {
  const id = entry.id.trim();
  const bodyRegion = entry.bodyRegion.trim();
  if (id.length === 0 || bodyRegion.length === 0) {
    return null;
  }

  const notes =
    entry.notes === null
      ? null
      : entry.notes.trim().length === 0
        ? null
        : entry.notes.trim();

  return Object.freeze({
    id,
    bodyRegion,
    severity: entry.severity,
    notes,
    active: entry.active,
  });
}

function dedupeEquipment(
  items: readonly EquipmentItem[],
): readonly EquipmentItem[] {
  const seen = new Set<EquipmentItem>();
  const result: EquipmentItem[] = [];
  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return Object.freeze(result);
}
