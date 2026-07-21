import type { AthleteGoal } from "./AthleteGoal";
import type { EquipmentProfile } from "./EquipmentProfile";
import type { InjuryProfile } from "./InjuryProfile";
import type { TrainingAvailability } from "./TrainingAvailability";
import type { TrainingExperience } from "./TrainingExperience";
import type { TrainingPreference } from "./TrainingPreference";

/**
 * Complete structured athlete identity for coaching context.
 *
 * Distinct from Training Engine `AthleteProfile` (program generation input)
 * and AI memory profile. Consumed by Prompt Builder and Coach Intelligence
 * via AthleteContextRepository — never directly from UI screens.
 */
export interface AthleteProfile {
  readonly id: string;
  readonly displayName: string | null;
  /** Age in whole years; null when unknown. */
  readonly ageYears: number | null;
  /** Canonical height in centimeters; null when unknown. */
  readonly heightCm: number | null;
  /** Canonical body weight in kilograms; null when unknown. */
  readonly weightKg: number | null;
  readonly goal: AthleteGoal;
  readonly experience: TrainingExperience;
  readonly availability: TrainingAvailability;
  readonly preference: TrainingPreference;
  readonly equipment: EquipmentProfile;
  readonly injuries: InjuryProfile;
  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
  /** ISO-8601 last update timestamp. */
  readonly updatedAt: string;
}
