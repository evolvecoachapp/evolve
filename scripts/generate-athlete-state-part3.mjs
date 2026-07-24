/**
 * Sprint 22.1 — Athlete State Engine generator part 3 (builders, aggregation, evolution).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/athlete-state");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

write(
  "builders/AthleteStateBuilder.ts",
  `import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { AthleteStatusKinds } from "../models/AthleteStatus";
import type { AthleteState } from "../models/AthleteState";
import {
  AthleteStateCapabilityKinds,
  type AthleteStateDescriptor,
} from "../models/AthleteStateDescriptor";
import { INITIAL_STATE_VERSION } from "../models/StateVersion";
import {
  freezeDescriptor,
  freezeState,
} from "../utils/FreezeAthleteState";

export function buildEmptyAthleteState(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly displayName?: string | null;
  readonly at: string;
}): AthleteState {
  const identity = Object.freeze({
    athleteId: input.athleteId,
    displayName: input.displayName ?? null,
    externalIds: Object.freeze({} as Record<string, string>),
  });
  const status = Object.freeze({
    kind: AthleteStatusKinds.UNKNOWN,
    label: null,
    notes: Object.freeze([] as string[]),
  });
  const emptyNotes = Object.freeze([] as string[]);
  const emptyAgents = Object.freeze([] as string[]);
  const measurements = Object.freeze({
    heightCm: null,
    weightKg: null,
    waistCm: null,
    chestCm: null,
    hipsCm: null,
    recordedAt: null,
  });
  const composition = Object.freeze({
    bodyFatPercent: null,
    leanMassKg: null,
    fatMassKg: null,
    recordedAt: null,
  });

  return freezeState({
    id: input.id,
    athleteId: input.athleteId,
    version: INITIAL_STATE_VERSION,
    identity,
    profile: Object.freeze({
      identity,
      status,
      sex: null,
      birthYear: null,
      experienceLevel: null,
      metadata: EMPTY_ATHLETE_METADATA,
    }),
    metrics: Object.freeze({
      measurements,
      composition,
      restingHeartRate: null,
      vo2Max: null,
      notes: emptyNotes,
    }),
    status,
    bodyComposition: composition,
    bodyMeasurements: measurements,
    training: Object.freeze({
      phase: null,
      focus: null,
      sessionsPerWeek: null,
      lastSessionId: null,
      lastSessionAt: null,
      programId: null,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    recovery: Object.freeze({
      status: null,
      lastRecoverySessionId: null,
      lastAssessedAt: null,
      modalities: emptyNotes,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    nutrition: Object.freeze({
      planId: null,
      dietaryPattern: null,
      lastLoggedAt: null,
      targetsPresent: false,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    performance: Object.freeze({
      lastSnapshotId: null,
      trendLabel: null,
      highlights: emptyNotes,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    lifestyle: Object.freeze({
      activityLevel: null,
      occupationLoad: null,
      notes: emptyNotes,
    }),
    health: Object.freeze({
      flags: emptyNotes,
      clearanceStatus: null,
      notes: emptyNotes,
    }),
    readiness: Object.freeze({
      label: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    fatigue: Object.freeze({
      label: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    sleep: Object.freeze({
      lastNightHours: null,
      qualityLabel: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    stress: Object.freeze({
      label: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    hydration: Object.freeze({
      status: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    energyAvailability: Object.freeze({
      label: null,
      reportedAt: null,
      notes: emptyNotes,
    }),
    goals: Object.freeze({
      primaryGoalId: null,
      items: Object.freeze([] as never[]),
      sourceAgentIds: emptyAgents,
    }),
    preferences: Object.freeze({
      preferredTrainingTimes: emptyNotes,
      preferredModalities: emptyNotes,
      dietaryPreferences: emptyNotes,
      communicationTone: null,
      notes: emptyNotes,
    }),
    constraints: Object.freeze({
      injuries: emptyNotes,
      equipmentLimits: emptyNotes,
      scheduleLimits: emptyNotes,
      medicalFlags: emptyNotes,
      notes: emptyNotes,
    }),
    progress: Object.freeze({
      milestones: emptyNotes,
      recentWins: emptyNotes,
      blockers: emptyNotes,
      notes: emptyNotes,
      sourceAgentIds: emptyAgents,
    }),
    coaching: Object.freeze({
      activeSessionId: null,
      lastSessionId: null,
      lastIntent: null,
      focusAreas: emptyNotes,
      notes: emptyNotes,
      sourceSessionIds: emptyNotes,
    }),
    history: Object.freeze({
      athleteId: input.athleteId,
      entries: Object.freeze([] as never[]),
      metadata: EMPTY_ATHLETE_METADATA,
    }),
    timeline: Object.freeze({
      athleteId: input.athleteId,
      items: Object.freeze([] as never[]),
      metadata: EMPTY_ATHLETE_METADATA,
    }),
    statistics: Object.freeze({
      updateCount: 0,
      snapshotCount: 0,
      historyEntryCount: 0,
      timelineItemCount: 0,
      goalCount: 0,
      sourceAgentCount: 0,
    }),
    decisionHistory: Object.freeze({
      athleteId: input.athleteId,
      entries: Object.freeze([] as never[]),
    }),
    diagnostics: Object.freeze({
      warnings: emptyNotes,
      notes: emptyNotes,
      metadata: EMPTY_ATHLETE_METADATA,
    }),
    summary: null,
    metadata: EMPTY_ATHLETE_METADATA,
    createdAt: input.at,
    updatedAt: input.at,
    frozenAt: input.at,
  });
}

export function buildAthleteStateDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): AthleteStateDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Athlete State Engine",
    version: "1.0.0",
    capabilities: Object.freeze([
      AthleteStateCapabilityKinds.BUILD,
      AthleteStateCapabilityKinds.UPDATE,
      AthleteStateCapabilityKinds.SNAPSHOT,
      AthleteStateCapabilityKinds.DESCRIBE,
      AthleteStateCapabilityKinds.VALIDATE,
    ]),
    metadata: EMPTY_ATHLETE_METADATA,
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/SnapshotBuilder.ts",
  `import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import type { AthleteTimeline } from "../models/AthleteTimeline";
import type { StateSummary } from "../models/StateSummary";
import { freezeSnapshot } from "../utils/FreezeAthleteState";

export function buildAthleteSnapshot(input: {
  readonly id: string;
  readonly state: AthleteState;
  readonly summary?: StateSummary | null;
  readonly timeline?: AthleteTimeline | null;
  readonly createdAt: string;
}): AthleteSnapshot {
  return freezeSnapshot({
    id: input.id,
    athleteId: input.state.athleteId,
    version: input.state.version,
    state: input.state,
    summary: input.summary ?? input.state.summary,
    timeline: input.timeline ?? input.state.timeline,
    metadata: EMPTY_ATHLETE_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
`,
);

write(
  "builders/TimelineBuilder.ts",
  `import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteTimeline } from "../models/AthleteTimeline";
import type { StateChange } from "../models/StateChange";
import { freezeTimeline } from "../utils/FreezeAthleteState";

export function buildEmptyTimeline(athleteId: string): AthleteTimeline {
  return freezeTimeline({
    athleteId,
    items: Object.freeze([]),
    metadata: EMPTY_ATHLETE_METADATA,
  });
}

export function appendTimelineChange(input: {
  readonly timeline: AthleteTimeline;
  readonly change: StateChange;
  readonly itemId: string;
}): AthleteTimeline {
  const sequence = input.timeline.items.length + 1;
  return freezeTimeline({
    athleteId: input.timeline.athleteId,
    items: Object.freeze([
      ...input.timeline.items,
      Object.freeze({
        id: input.itemId,
        sequence,
        change: input.change,
        occurredAt: input.change.changedAt,
      }),
    ]),
    metadata: input.timeline.metadata,
  });
}
`,
);

write(
  "builders/SummaryBuilder.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { StateSummary } from "../models/StateSummary";
import { formatAthleteHeadline, formatGoalTitles } from "../utils/FormattingHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import { freezeSummary } from "../utils/FreezeAthleteState";

export function buildStateSummary(input: {
  readonly state: AthleteState;
  readonly createdAt: string;
}): StateSummary {
  const stats = buildStatistics(input.state);
  const goals = formatGoalTitles(input.state);
  const details = Object.freeze([
    \`Training focus: \${input.state.training.focus ?? "none"}\`,
    \`Recovery status: \${input.state.recovery.status ?? "unknown"}\`,
    \`Nutrition plan: \${input.state.nutrition.planId ?? "none"}\`,
    \`Goals: \${goals.length > 0 ? goals.join(", ") : "none"}\`,
    \`Readiness: \${input.state.readiness.label ?? "unknown"}\`,
  ]);
  return freezeSummary({
    athleteId: input.state.athleteId,
    version: input.state.version,
    status: input.state.status.kind,
    headline: formatAthleteHeadline(input.state),
    details,
    statistics: stats,
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/ResultBuilder.ts",
  `import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type {
  AthleteStateOperationKind,
  AthleteStateResult,
} from "../models/AthleteStateResult";
import type { CoachSupervisorContext } from "../models/CoachSupervisorContext";
import type { StateDiagnostics } from "../models/StateDiagnostics";
import type { StateError } from "../models/StateError";
import type { StateSummary } from "../models/StateSummary";
import {
  EMPTY_STATE_VALIDATION,
  type StateValidation,
} from "../models/StateValidation";
import { freezeResult } from "../utils/FreezeAthleteState";

export function buildAthleteStateResult(input: {
  readonly id: string;
  readonly operation: AthleteStateOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly athleteId?: string | null;
  readonly state?: AthleteState | null;
  readonly snapshot?: AthleteSnapshot | null;
  readonly summary?: StateSummary | null;
  readonly supervisorContext?: CoachSupervisorContext | null;
  readonly descriptor?: AthleteStateDescriptor | null;
  readonly validation?: StateValidation;
  readonly diagnostics?: StateDiagnostics;
  readonly error?: StateError | null;
  readonly startedAt: string;
  readonly completedAt: string;
}): AthleteStateResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    message: input.message,
    athleteId: input.athleteId ?? input.state?.athleteId ?? null,
    state: input.state ?? null,
    snapshot: input.snapshot ?? null,
    summary: input.summary ?? null,
    supervisorContext: input.supervisorContext ?? null,
    descriptor: input.descriptor ?? null,
    validation: input.validation ?? EMPTY_STATE_VALIDATION,
    diagnostics: input.diagnostics ??
      Object.freeze({
        warnings: Object.freeze([] as string[]),
        notes: Object.freeze([] as string[]),
        metadata: EMPTY_ATHLETE_METADATA,
      }),
    error: input.error ?? null,
    metadata: EMPTY_ATHLETE_METADATA,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    frozenAt: input.completedAt,
  });
}
`,
);

write(
  "builders/SupervisorContextBuilder.ts",
  `import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import type { CoachSupervisorContext } from "../models/CoachSupervisorContext";
import type { StateSummary } from "../models/StateSummary";
import { freezeSupervisorContext } from "../utils/FreezeAthleteState";

export function buildCoachSupervisorContext(input: {
  readonly state: AthleteState;
  readonly snapshot?: AthleteSnapshot | null;
  readonly summary?: StateSummary | null;
  readonly createdAt: string;
}): CoachSupervisorContext {
  return freezeSupervisorContext({
    athleteId: input.state.athleteId,
    state: input.state,
    snapshot: input.snapshot ?? null,
    summary: input.summary ?? input.state.summary,
    focusAreas: input.state.coaching.focusAreas,
    metadata: EMPTY_ATHLETE_METADATA,
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/index.ts",
  `export * from "./AthleteStateBuilder";
export * from "./SnapshotBuilder";
export * from "./TimelineBuilder";
export * from "./SummaryBuilder";
export * from "./ResultBuilder";
export * from "./SupervisorContextBuilder";
`,
);

// Aggregation — deterministic, no AI, no calculations
write(
  "aggregation/ProfileAggregator.ts",
  `import type { AthleteProfile } from "../models/AthleteProfile";
import type { AthleteStatus } from "../models/AthleteStatus";
import { AthleteStatusKinds } from "../models/AthleteStatus";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeProfile, freezeStatus } from "../utils/FreezeAthleteState";

/**
 * Aggregates profile/status representation from contributions (no scoring).
 */
export function aggregateProfile(input: {
  readonly profile: AthleteProfile;
  readonly contributions: readonly SpecialistContribution[];
}): AthleteProfile {
  let status: AthleteStatus = input.profile.status;
  const hasRecovery = input.contributions.some((c) => c.recovery != null);
  const hasTraining = input.contributions.some((c) => c.training != null);
  const hasConstraints = input.contributions.some(
    (c) => c.constraints != null && c.constraints.injuries.length > 0,
  );

  if (hasConstraints) {
    status = freezeStatus({
      kind: AthleteStatusKinds.CONSTRAINED,
      label: "constrained",
      notes: Object.freeze(["constraints present"]),
    });
  } else if (hasRecovery && !hasTraining) {
    status = freezeStatus({
      kind: AthleteStatusKinds.RECOVERING,
      label: "recovering",
      notes: Object.freeze(["recovery contribution present"]),
    });
  } else if (hasTraining || hasRecovery) {
    status = freezeStatus({
      kind: AthleteStatusKinds.ACTIVE,
      label: "active",
      notes: Object.freeze(["specialist contributions present"]),
    });
  }

  return freezeProfile({
    ...input.profile,
    status,
  });
}
`,
);

write(
  "aggregation/TrainingAggregator.ts",
  `import type { TrainingState } from "../models/TrainingState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeTraining } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateTraining(input: {
  readonly current: TrainingState;
  readonly contributions: readonly SpecialistContribution[];
}): TrainingState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.training) continue;
    next = freezeTraining({
      phase: c.training.phase ?? next.phase,
      focus: c.training.focus ?? next.focus,
      sessionsPerWeek: c.training.sessionsPerWeek ?? next.sessionsPerWeek,
      lastSessionId: c.training.lastSessionId ?? next.lastSessionId,
      lastSessionAt: c.training.lastSessionAt ?? next.lastSessionAt,
      programId: c.training.programId ?? next.programId,
      notes: mergeUniqueStrings(next.notes, c.training.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.training.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}
`,
);

write(
  "aggregation/RecoveryAggregator.ts",
  `import type { RecoveryState } from "../models/RecoveryState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeRecovery } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateRecovery(input: {
  readonly current: RecoveryState;
  readonly contributions: readonly SpecialistContribution[];
}): RecoveryState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.recovery) continue;
    next = freezeRecovery({
      status: c.recovery.status ?? next.status,
      lastRecoverySessionId:
        c.recovery.lastRecoverySessionId ?? next.lastRecoverySessionId,
      lastAssessedAt: c.recovery.lastAssessedAt ?? next.lastAssessedAt,
      modalities: mergeUniqueStrings(next.modalities, c.recovery.modalities),
      notes: mergeUniqueStrings(next.notes, c.recovery.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.recovery.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}
`,
);

write(
  "aggregation/NutritionAggregator.ts",
  `import type { NutritionState } from "../models/NutritionState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeNutrition } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateNutrition(input: {
  readonly current: NutritionState;
  readonly contributions: readonly SpecialistContribution[];
}): NutritionState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.nutrition) continue;
    next = freezeNutrition({
      planId: c.nutrition.planId ?? next.planId,
      dietaryPattern: c.nutrition.dietaryPattern ?? next.dietaryPattern,
      lastLoggedAt: c.nutrition.lastLoggedAt ?? next.lastLoggedAt,
      targetsPresent: c.nutrition.targetsPresent || next.targetsPresent,
      notes: mergeUniqueStrings(next.notes, c.nutrition.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.nutrition.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}
`,
);

write(
  "aggregation/PerformanceAggregator.ts",
  `import type { PerformanceState } from "../models/PerformanceState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezePerformance } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregatePerformance(input: {
  readonly current: PerformanceState;
  readonly contributions: readonly SpecialistContribution[];
}): PerformanceState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.performance) continue;
    next = freezePerformance({
      lastSnapshotId: c.performance.lastSnapshotId ?? next.lastSnapshotId,
      trendLabel: c.performance.trendLabel ?? next.trendLabel,
      highlights: mergeUniqueStrings(next.highlights, c.performance.highlights),
      notes: mergeUniqueStrings(next.notes, c.performance.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.performance.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}
`,
);

write(
  "aggregation/LifestyleAggregator.ts",
  `import type { LifestyleState } from "../models/LifestyleState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeLifestyle } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

/**
 * Lifestyle aggregation — copies notes from contributions only.
 */
export function aggregateLifestyle(input: {
  readonly current: LifestyleState;
  readonly contributions: readonly SpecialistContribution[];
}): LifestyleState {
  const notes = mergeUniqueStrings(
    input.current.notes,
    ...input.contributions.map((c) => c.notes),
  );
  return freezeLifestyle({
    ...input.current,
    notes,
  });
}
`,
);

write(
  "aggregation/GoalAggregator.ts",
  `import type { AthleteGoals } from "../models/AthleteGoals";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeGoals } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateGoals(input: {
  readonly current: AthleteGoals;
  readonly contributions: readonly SpecialistContribution[];
}): AthleteGoals {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.goals) continue;
    const byId = new Map(next.items.map((g) => [g.id, g]));
    for (const item of c.goals.items) {
      byId.set(item.id, item);
    }
    next = freezeGoals({
      primaryGoalId: c.goals.primaryGoalId ?? next.primaryGoalId,
      items: Object.freeze([...byId.values()]),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.goals.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}
`,
);

write(
  "aggregation/ProgressAggregator.ts",
  `import type { ProgressState } from "../models/ProgressState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { freezeProgress } from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";

export function aggregateProgress(input: {
  readonly current: ProgressState;
  readonly contributions: readonly SpecialistContribution[];
}): ProgressState {
  let next = input.current;
  for (const c of input.contributions) {
    if (!c.progress) continue;
    next = freezeProgress({
      milestones: mergeUniqueStrings(next.milestones, c.progress.milestones),
      recentWins: mergeUniqueStrings(next.recentWins, c.progress.recentWins),
      blockers: mergeUniqueStrings(next.blockers, c.progress.blockers),
      notes: mergeUniqueStrings(next.notes, c.progress.notes),
      sourceAgentIds: mergeUniqueStrings(
        next.sourceAgentIds,
        c.progress.sourceAgentIds,
        [c.agentId],
      ),
    });
  }
  return next;
}
`,
);

write(
  "aggregation/HistoryAggregator.ts",
  `import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import type { AthleteHistory } from "../models/AthleteHistory";
import type { StateChange } from "../models/StateChange";
import { freezeHistory } from "../utils/FreezeAthleteState";

export function aggregateHistory(input: {
  readonly current: AthleteHistory;
  readonly change: StateChange;
  readonly entryId: string;
}): AthleteHistory {
  return freezeHistory({
    athleteId: input.current.athleteId,
    entries: Object.freeze([
      ...input.current.entries,
      Object.freeze({
        id: input.entryId,
        change: input.change,
        recordedAt: input.change.changedAt,
      }),
    ]),
    metadata: input.current.metadata ?? EMPTY_ATHLETE_METADATA,
  });
}
`,
);

write(
  "aggregation/StateAggregator.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import {
  freezeCoaching,
  freezeConstraints,
  freezeFatigue,
  freezePreferences,
  freezeReadiness,
  freezeSleep,
  freezeState,
  freezeStress,
} from "../utils/FreezeAthleteState";
import { mergeUniqueStrings } from "../utils/StateHelpers";
import { aggregateGoals } from "./GoalAggregator";
import { aggregateLifestyle } from "./LifestyleAggregator";
import { aggregateNutrition } from "./NutritionAggregator";
import { aggregatePerformance } from "./PerformanceAggregator";
import { aggregateProfile } from "./ProfileAggregator";
import { aggregateProgress } from "./ProgressAggregator";
import { aggregateRecovery } from "./RecoveryAggregator";
import { aggregateTraining } from "./TrainingAggregator";

/**
 * Deterministic aggregation of specialist contributions into AthleteState.
 * Aggregation only — no AI, no business calculations.
 */
export function aggregateAthleteState(input: {
  readonly state: AthleteState;
  readonly contributions: readonly SpecialistContribution[];
  readonly updatedAt: string;
}): AthleteState {
  const { contributions } = input;
  let training = aggregateTraining({
    current: input.state.training,
    contributions,
  });
  let recovery = aggregateRecovery({
    current: input.state.recovery,
    contributions,
  });
  let nutrition = aggregateNutrition({
    current: input.state.nutrition,
    contributions,
  });
  let performance = aggregatePerformance({
    current: input.state.performance,
    contributions,
  });
  let lifestyle = aggregateLifestyle({
    current: input.state.lifestyle,
    contributions,
  });
  let goals = aggregateGoals({
    current: input.state.goals,
    contributions,
  });
  let progress = aggregateProgress({
    current: input.state.progress,
    contributions,
  });
  let profile = aggregateProfile({
    profile: input.state.profile,
    contributions,
  });

  let readiness = input.state.readiness;
  let fatigue = input.state.fatigue;
  let sleep = input.state.sleep;
  let stress = input.state.stress;
  let preferences = input.state.preferences;
  let constraints = input.state.constraints;
  let coaching = input.state.coaching;

  for (const c of contributions) {
    if (c.readiness) readiness = freezeReadiness(c.readiness);
    if (c.fatigue) fatigue = freezeFatigue(c.fatigue);
    if (c.sleep) sleep = freezeSleep(c.sleep);
    if (c.stress) stress = freezeStress(c.stress);
    if (c.preferences) {
      preferences = freezePreferences({
        preferredTrainingTimes: mergeUniqueStrings(
          preferences.preferredTrainingTimes,
          c.preferences.preferredTrainingTimes,
        ),
        preferredModalities: mergeUniqueStrings(
          preferences.preferredModalities,
          c.preferences.preferredModalities,
        ),
        dietaryPreferences: mergeUniqueStrings(
          preferences.dietaryPreferences,
          c.preferences.dietaryPreferences,
        ),
        communicationTone:
          c.preferences.communicationTone ?? preferences.communicationTone,
        notes: mergeUniqueStrings(preferences.notes, c.preferences.notes),
      });
    }
    if (c.constraints) {
      constraints = freezeConstraints({
        injuries: mergeUniqueStrings(
          constraints.injuries,
          c.constraints.injuries,
        ),
        equipmentLimits: mergeUniqueStrings(
          constraints.equipmentLimits,
          c.constraints.equipmentLimits,
        ),
        scheduleLimits: mergeUniqueStrings(
          constraints.scheduleLimits,
          c.constraints.scheduleLimits,
        ),
        medicalFlags: mergeUniqueStrings(
          constraints.medicalFlags,
          c.constraints.medicalFlags,
        ),
        notes: mergeUniqueStrings(constraints.notes, c.constraints.notes),
      });
    }
    if (c.coaching) {
      coaching = freezeCoaching({
        activeSessionId:
          c.coaching.activeSessionId ?? coaching.activeSessionId,
        lastSessionId: c.coaching.lastSessionId ?? coaching.lastSessionId,
        lastIntent: c.coaching.lastIntent ?? coaching.lastIntent,
        focusAreas: mergeUniqueStrings(
          coaching.focusAreas,
          c.coaching.focusAreas,
        ),
        notes: mergeUniqueStrings(coaching.notes, c.coaching.notes),
        sourceSessionIds: mergeUniqueStrings(
          coaching.sourceSessionIds,
          c.coaching.sourceSessionIds,
        ),
      });
    }
  }

  return freezeState({
    ...input.state,
    profile,
    status: profile.status,
    training,
    recovery,
    nutrition,
    performance,
    lifestyle,
    readiness,
    fatigue,
    sleep,
    stress,
    goals,
    preferences,
    constraints,
    progress,
    coaching,
    updatedAt: input.updatedAt,
    frozenAt: input.updatedAt,
  });
}
`,
);

write(
  "aggregation/index.ts",
  `export * from "./ProfileAggregator";
export * from "./TrainingAggregator";
export * from "./RecoveryAggregator";
export * from "./NutritionAggregator";
export * from "./PerformanceAggregator";
export * from "./LifestyleAggregator";
export * from "./GoalAggregator";
export * from "./ProgressAggregator";
export * from "./HistoryAggregator";
export * from "./StateAggregator";
`,
);

// Evolution
write(
  "evolution/VersionManager.ts",
  `import type { StateVersion } from "../models/StateVersion";
import { bumpRevision } from "../utils/VersionHelpers";

export class VersionManager {
  next(version: StateVersion): StateVersion {
    return bumpRevision(version);
  }
}

export function createVersionManager(): VersionManager {
  return new VersionManager();
}
`,
);

write(
  "evolution/ChangeTracker.ts",
  `import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import {
  StateChangeKinds,
  type StateChange,
  type StateChangeKind,
} from "../models/StateChange";
import type { StateVersion } from "../models/StateVersion";
import { freezeChange } from "../utils/FreezeAthleteState";

export function trackStateChange(input: {
  readonly id: string;
  readonly kind?: StateChangeKind;
  readonly athleteId: string;
  readonly fromVersion: StateVersion | null;
  readonly toVersion: StateVersion;
  readonly paths: readonly string[];
  readonly summary: string;
  readonly source: string;
  readonly changedAt: string;
}): StateChange {
  return freezeChange({
    id: input.id,
    kind: input.kind ?? StateChangeKinds.UPDATE,
    athleteId: input.athleteId,
    fromVersion: input.fromVersion,
    toVersion: input.toVersion,
    paths: Object.freeze([...input.paths]),
    summary: input.summary,
    source: input.source,
    metadata: EMPTY_ATHLETE_METADATA,
    changedAt: input.changedAt,
  });
}
`,
);

write(
  "evolution/StateTransitionPlanner.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { contributionPaths } from "../utils/StateHelpers";

/**
 * Deterministic transition planning — no prediction / inference.
 */
export function planStateTransition(input: {
  readonly current: AthleteState | null;
  readonly contributions: readonly SpecialistContribution[];
}): {
  readonly paths: readonly string[];
  readonly source: string;
  readonly allowed: boolean;
  readonly reason: string;
} {
  if (!input.current && input.contributions.length === 0) {
    return Object.freeze({
      paths: Object.freeze(["identity", "profile"]),
      source: "build",
      allowed: true,
      reason: "Initial empty state build.",
    });
  }
  const paths = Object.freeze(
    input.contributions.flatMap((c) => [...contributionPaths(c)]),
  );
  const sources = Object.freeze([
    ...new Set(input.contributions.map((c) => c.source)),
  ]);
  return Object.freeze({
    paths,
    source: sources.join(",") || "update",
    allowed: true,
    reason: "Deterministic contribution merge.",
  });
}
`,
);

write(
  "evolution/StateEvolutionEngine.ts",
  `import { aggregateHistory } from "../aggregation/HistoryAggregator";
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
      id: \`change:\${++this.sequence}\`,
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
      entryId: \`history:\${this.sequence}\`,
    });
    const timeline = appendTimelineChange({
      timeline: aggregated.timeline,
      change,
      itemId: \`timeline:\${this.sequence}\`,
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
`,
);

write(
  "evolution/index.ts",
  `export * from "./VersionManager";
export * from "./ChangeTracker";
export * from "./StateTransitionPlanner";
export * from "./StateEvolutionEngine";
export { buildAthleteSnapshot as evolutionSnapshotBuilder } from "../builders/SnapshotBuilder";
export { appendTimelineChange as evolutionTimelineBuilder } from "../builders/TimelineBuilder";
`,
);

console.log("Part 3 (builders + aggregation + evolution) written");
