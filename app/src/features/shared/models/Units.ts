export type UnitsSystem = "metric" | "imperial";

export type WeightUnit = "kg" | "lb";

export type HeightUnit = "cm" | "ft_in";

export type DistanceUnit = "km" | "mi";

export type EnergyUnit = "kcal" | "kJ";

export type VolumeUnit = "ml" | "fl_oz";

/** Measurement units applied across workout, nutrition, and progress surfaces. */
export interface Units {
  system: UnitsSystem;
  weight: WeightUnit;
  height: HeightUnit;
  distance: DistanceUnit;
  energy: EnergyUnit;
  volume: VolumeUnit;
}
