export interface ProgressStatMock {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  icon: "scale-outline" | "barbell-outline" | "flame-outline" | "checkmark-circle-outline";
}

export interface ProgressMock {
  stats: ProgressStatMock[];
}

export const progressMock: ProgressMock = {
  stats: [
    { label: "Weight", value: "78.5", unit: "kg", trend: "-0.3 kg this week", icon: "scale-outline" },
    { label: "Strength", value: "+12%", trend: "vs. 4 weeks ago", icon: "barbell-outline" },
    { label: "Workout Streak", value: "5", unit: "days", icon: "flame-outline" },
    { label: "Adherence", value: "87", unit: "%", trend: "+3% this week", icon: "checkmark-circle-outline" },
  ],
};
