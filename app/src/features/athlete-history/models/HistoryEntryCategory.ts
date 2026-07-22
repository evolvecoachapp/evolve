/**
 * History entry category identifier.
 * Open string for extensibility without redesigning core models.
 */
export type HistoryEntryCategory = string;

export const HistoryEntryCategories = {
  TRAINING: "training",
  PERFORMANCE: "performance",
  ACHIEVEMENT: "achievement",
  /** Reserved — architecture support only; not implemented this sprint. */
  NUTRITION: "nutrition",
  /** Reserved — architecture support only; not implemented this sprint. */
  RECOVERY: "recovery",
  /** Reserved — architecture support only; not implemented this sprint. */
  WELLNESS: "wellness",
  /** Reserved — architecture support only; not implemented this sprint. */
  COACHING: "coaching",
  /** Reserved — architecture support only; not implemented this sprint. */
  GOALS: "goals",
} as const satisfies Record<string, HistoryEntryCategory>;
