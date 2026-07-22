/**
 * History entry type identifier.
 * Open string for extensibility without redesigning core models.
 */
export type HistoryEntryType = string;

export const HistoryEntryTypes = {
  WORKOUT: "workout",
  PERFORMANCE: "performance",
  ACHIEVEMENT: "achievement",
  /** Reserved — architecture support only; not implemented this sprint. */
  NUTRITION: "nutrition",
  /** Reserved — architecture support only; not implemented this sprint. */
  RECOVERY: "recovery",
  /** Reserved — architecture support only; not implemented this sprint. */
  SLEEP: "sleep",
  /** Reserved — architecture support only; not implemented this sprint. */
  BODYWEIGHT: "bodyweight",
  /** Reserved — architecture support only; not implemented this sprint. */
  COACH: "coach",
  /** Reserved — architecture support only; not implemented this sprint. */
  GOALS: "goals",
  /** Reserved — architecture support only; not implemented this sprint. */
  MILESTONES: "milestones",
  /** Reserved — architecture support only; not implemented this sprint. */
  CHALLENGES: "challenges",
} as const satisfies Record<string, HistoryEntryType>;
