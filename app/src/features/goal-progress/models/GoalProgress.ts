import type { GoalCheckpoint } from "./GoalCheckpoint";
import type { GoalCategory } from "./GoalCategory";
import type { GoalDeviation } from "./GoalDeviation";
import type { GoalConstraint } from "./GoalConstraint";
import type { GoalDependency } from "./GoalDependency";
import type { GoalEvaluation } from "./GoalEvaluation";
import type { GoalMetadata } from "./GoalMetadata";
import type { GoalMilestone } from "./GoalMilestone";
import type { GoalPriority } from "./GoalPriority";
import type { GoalConfidence } from "./GoalConfidence";
import type { GoalRisk } from "./GoalRisk";
import type { GoalAchievement } from "./GoalAchievement";

/**
 * Primary Goal Progress Engine output.
 * Goal progress evaluation only — never modifies plans.
 */
export interface GoalProgress {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly category: GoalCategory;
  readonly triggers: readonly GoalAchievement[];
  readonly conditions: readonly GoalDeviation[];
  readonly candidates: readonly GoalCheckpoint[];
  readonly opportunities: readonly GoalMilestone[];
  readonly reasons: readonly GoalConfidence[];
  readonly evaluation: GoalEvaluation;
  readonly priority: GoalPriority;
  readonly severity: GoalRisk;
  readonly dependencies: readonly GoalDependency[];
  readonly constraints: readonly GoalConstraint[];
  readonly signalKeys: readonly string[];
  readonly sourceKeys: readonly string[];
  readonly metadata: GoalMetadata;
  readonly createdAt: string;
}
