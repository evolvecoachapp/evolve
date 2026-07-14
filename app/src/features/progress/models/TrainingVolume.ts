export interface TrainingVolumeWeek {
  weekStart: string;
  totalSets: number;
  totalReps: number;
  totalWeightKg: number;
}

/** Training volume trend across recent weeks. */
export interface TrainingVolume {
  weeks: TrainingVolumeWeek[];
  currentWeekSets: number;
  changePercent: number;
}
