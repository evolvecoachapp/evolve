export type MilestoneCategory = "strength" | "consistency" | "body" | "nutrition";

/** Achievement milestone reached during the fitness journey. */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
  category: MilestoneCategory;
}
