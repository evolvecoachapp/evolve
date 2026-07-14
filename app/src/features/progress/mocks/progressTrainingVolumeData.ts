import type { TrainingVolume } from "../models/TrainingVolume";

export const mockTrainingVolumeData: TrainingVolume = {
  currentWeekSets: 68,
  changePercent: 8,
  weeks: [
    { weekStart: "2026-06-16", totalSets: 58, totalReps: 520, totalWeightKg: 12400 },
    { weekStart: "2026-06-23", totalSets: 62, totalReps: 558, totalWeightKg: 13100 },
    { weekStart: "2026-06-30", totalSets: 63, totalReps: 567, totalWeightKg: 13450 },
    { weekStart: "2026-07-07", totalSets: 68, totalReps: 612, totalWeightKg: 14200 },
  ],
};
