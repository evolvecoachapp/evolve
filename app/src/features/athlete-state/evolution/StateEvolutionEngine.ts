import { aggregateHistory } from "../aggregation/HistoryAggregator";
import { aggregateAthleteState } from "../aggregation/StateAggregator";
import { appendTimelineChange } from "../builders/TimelineBuilder";
import { buildStateSummary } from "../builders/SummaryBuilder";
import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { StateChangeKinds } from "../models/StateChange";
import { freezeState } from "../utils/FreezeAthleteState";
import { buildStatistics } from "../utils/StatisticsHelpers";
import { trackStateChange } from "./ChangeTracker";
import { planStateTransition } from "./StateTransitionPlanner";
import { createVersionManager } from "./VersionManager";

/**
 * Deterministic state evolution — version bump, aggregate, track change.
 * No prediction. No inference. No AI.
 */
export class StateEvolutionEngine {
  private readonly versions = createVersionManager();
  private sequence = 0;

  evolve(input: {
    readonly state: AthleteState;
    readonly contributions: readonly SpecialistContribution[];
    readonly kind?: (typeof StateChangeKinds)[keyof typeof StateChangeKinds];
    readonly at: string;
  }): AthleteState {
    const plan = planStateTransition({
      current: input.state,
      contributions: input.contributions,
    });
    const fromVersion = input.state.version;
    const toVersion = this.versions.next(fromVersion);
    const aggregated = aggregateAthleteState({
      state: input.state,
      contributions: input.contributions,
      updatedAt: input.at,
    });
    const change = trackStateChange({
      id: `change:${++this.sequence}`,
      kind: input.kind ?? StateChangeKinds.UPDATE,
      athleteId: input.state.athleteId,
      fromVersion,
      toVersion,
      paths: plan.paths,
      summary: plan.reason,
      source: plan.source,
      changedAt: input.at,
    });
    const history = aggregateHistory({
      current: aggregated.history,
      change,
      entryId: `history:${this.sequence}`,
    });
    const timeline = appendTimelineChange({
      timeline: aggregated.timeline,
      change,
      itemId: `timeline:${this.sequence}`,
    });
    const withHistory = freezeState({
      ...aggregated,
      version: toVersion,
      history,
      timeline,
      statistics: Object.freeze({
        ...buildStatistics({
          ...aggregated,
          history,
          timeline,
        }),
        snapshotCount: aggregated.statistics.snapshotCount,
      }),
    });
    const summary = buildStateSummary({
      state: withHistory,
      createdAt: input.at,
    });
    return freezeState({
      ...withHistory,
      summary,
      statistics: buildStatistics({ ...withHistory, summary }),
    });
  }
}

export function createStateEvolutionEngine(): StateEvolutionEngine {
  return new StateEvolutionEngine();
}
