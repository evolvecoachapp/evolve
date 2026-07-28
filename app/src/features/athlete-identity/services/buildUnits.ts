import type {
  AthleteUnits,
  DistanceUnit,
  EnergyUnit,
  LengthUnit,
  MassUnit,
  UnitSystem,
} from "../models/AthleteUnits";

export interface BuildUnitsInput {
  readonly system: UnitSystem;
  readonly mass?: MassUnit;
  readonly length?: LengthUnit;
  readonly distance?: DistanceUnit;
  readonly energy?: EnergyUnit;
}

const METRIC_DEFAULTS = Object.freeze({
  mass: "kg" as const,
  length: "cm" as const,
  distance: "km" as const,
  energy: "kcal" as const,
});

const IMPERIAL_DEFAULTS = Object.freeze({
  mass: "lb" as const,
  length: "in" as const,
  distance: "mi" as const,
  energy: "kcal" as const,
});

/**
 * Builds immutable AthleteUnits from an explicit unit system.
 */
export function buildUnits(input: BuildUnitsInput): AthleteUnits {
  const defaults =
    input.system === "imperial" ? IMPERIAL_DEFAULTS : METRIC_DEFAULTS;

  return Object.freeze({
    system: input.system,
    mass: input.mass ?? defaults.mass,
    length: input.length ?? defaults.length,
    distance: input.distance ?? defaults.distance,
    energy: input.energy ?? defaults.energy,
  });
}
