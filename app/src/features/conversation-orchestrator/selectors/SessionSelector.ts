import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { ConversationSession } from "../models/ConversationSession";

/**
 * Builds ConversationSession linkage from CoachingContext + optional refs.
 * One responsibility: session selection only.
 */
export class SessionSelector {
  select(options: {
    readonly coachingContext: CoachingContext;
    readonly preparedAt: string;
    readonly insightSnapshot?: InsightSnapshot;
    readonly recoverySnapshot?: RecoverySnapshot;
    readonly athleteHistory?: AthleteHistory;
    readonly achievementResult?: AchievementResult;
    readonly performanceSnapshot?: PerformanceSnapshot;
  }): ConversationSession {
    const coachSession = options.coachingContext.session;

    return Object.freeze({
      athleteId:
        coachSession.athleteId ??
        options.athleteHistory?.athleteId ??
        options.performanceSnapshot?.context.athleteId ??
        options.recoverySnapshot?.context.athleteId ??
        null,
      sessionId:
        coachSession.sessionId ??
        options.achievementResult?.sessionId ??
        options.performanceSnapshot?.session.sessionId ??
        options.recoverySnapshot?.context.sessionId ??
        options.athleteHistory?.context.sessionId ??
        null,
      runtimeId:
        coachSession.runtimeId ??
        options.achievementResult?.runtimeId ??
        options.performanceSnapshot?.session.runtimeId ??
        options.recoverySnapshot?.context.runtimeId ??
        options.athleteHistory?.context.runtimeId ??
        null,
      dayId:
        coachSession.dayId ??
        options.performanceSnapshot?.context.dayId ??
        options.recoverySnapshot?.context.dayId ??
        options.athleteHistory?.context.dayId ??
        null,
      weekNumber:
        coachSession.weekNumber ??
        options.performanceSnapshot?.context.weekNumber ??
        options.recoverySnapshot?.context.weekNumber ??
        options.athleteHistory?.context.weekNumber ??
        null,
      coachingContextId: options.coachingContext.id,
      insightSnapshotId:
        coachSession.insightSnapshotId ?? options.insightSnapshot?.id ?? null,
      performanceSnapshotId:
        coachSession.performanceSnapshotId ??
        options.performanceSnapshot?.id ??
        null,
      achievementEvaluationId:
        coachSession.achievementEvaluationId ??
        options.achievementResult?.evaluationId ??
        null,
      recoverySnapshotId:
        coachSession.recoverySnapshotId ?? options.recoverySnapshot?.id ?? null,
      historyId: coachSession.historyId ?? options.athleteHistory?.id ?? null,
      preparedAt: options.preparedAt,
    });
  }
}

export function createSessionSelector(): SessionSelector {
  return new SessionSelector();
}
