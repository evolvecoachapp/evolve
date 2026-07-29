export const WeightUnitValues = { KG: "kg", LB: "lb" } as const;
export type WeightUnit = (typeof WeightUnitValues)[keyof typeof WeightUnitValues];

export const DistanceUnitValues = { KM: "km", MI: "mi" } as const;
export type DistanceUnit = (typeof DistanceUnitValues)[keyof typeof DistanceUnitValues];

export const HeightUnitValues = { CM: "cm", FT_IN: "ft_in" } as const;
export type HeightUnit = (typeof HeightUnitValues)[keyof typeof HeightUnitValues];

export interface MeasurementUnits {
  readonly weight: WeightUnit;
  readonly distance: DistanceUnit;
  readonly height: HeightUnit;
}

export function createMeasurementUnits(input: MeasurementUnits): MeasurementUnits {
  return Object.freeze({ ...input });
}
