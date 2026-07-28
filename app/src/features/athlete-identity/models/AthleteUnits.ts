/**
 * Immutable athlete measurement units (Sprint 29.1).
 */
export type UnitSystem = "metric" | "imperial";

export type MassUnit = "kg" | "lb";
export type LengthUnit = "cm" | "in";
export type DistanceUnit = "km" | "mi";
export type EnergyUnit = "kcal" | "kJ";

export interface AthleteUnits {
  readonly system: UnitSystem;
  readonly mass: MassUnit;
  readonly length: LengthUnit;
  readonly distance: DistanceUnit;
  readonly energy: EnergyUnit;
}
