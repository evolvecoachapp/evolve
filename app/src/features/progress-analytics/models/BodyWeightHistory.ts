import type { ProgressChart } from "./ProgressChart";

export interface BodyWeightEntry {
  readonly id: string;
  readonly recordedAt: string;
  readonly weightKg: number;
  readonly changeKg: number | null;
}

export interface BodyWeightHistory {
  readonly entries: readonly BodyWeightEntry[];
  readonly currentKg: number | null;
  readonly changeKg: number | null;
  readonly chart: ProgressChart | null;
  readonly destination: string | null;
}

export function createBodyWeightEntry(input: BodyWeightEntry): BodyWeightEntry {
  return Object.freeze({ ...input });
}

export function createBodyWeightHistory(input: BodyWeightHistory): BodyWeightHistory {
  return Object.freeze({
    entries: Object.freeze(input.entries.map(createBodyWeightEntry)),
    currentKg: input.currentKg,
    changeKg: input.changeKg,
    chart: input.chart,
    destination: input.destination,
  });
}
