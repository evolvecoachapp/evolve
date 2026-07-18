/** Strategy used to progress load, volume, or intensity over time. */
export enum ProgressionModel {
  Linear = "linear",
  DoubleProgression = "double_progression",
  PercentageBased = "percentage_based",
  AutoregulatedRpe = "autoregulated_rpe",
  Undulating = "undulating",
  Block = "block",
  Static = "static",
}
