/**
 * Sprint 22.1 — Athlete State Engine generator part 2 (utils, contracts, builders).
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
  "utils/FreezeAthleteState.ts",
  `import type { AthleteConstraints } from "../models/AthleteConstraints";
import type { AthleteGoals, AthleteGoalItem } from "../models/AthleteGoals";
import type { AthleteHistory, AthleteHistoryEntry } from "../models/AthleteHistory";
import type { AthleteIdentity } from "../models/AthleteIdentity";
import type { AthleteMetadata } from "../models/AthleteMetadata";
import type { AthleteMetrics } from "../models/AthleteMetrics";
import type { AthletePreferences } from "../models/AthletePreferences";
import type { AthleteProfile } from "../models/AthleteProfile";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type { AthleteStateRequest } from "../models/AthleteStateRequest";
import type { AthleteStateResult } from "../models/AthleteStateResult";
import type { AthleteStatistics } from "../models/AthleteStatistics";
import type { AthleteStatus } from "../models/AthleteStatus";
import type {
  AthleteTimeline,
  AthleteTimelineItem,
} from "../models/AthleteTimeline";
import type { BodyComposition } from "../models/BodyComposition";
import type { BodyMeasurements } from "../models/BodyMeasurements";
import type { CoachingState } from "../models/CoachingState";
import type { CoachSupervisorContext } from "../models/CoachSupervisorContext";
import type {
  DecisionHistory,
  DecisionHistoryEntry,
} from "../models/DecisionHistory";
import type { EnergyAvailability } from "../models/EnergyAvailability";
import type { FatigueState } from "../models/FatigueState";
import type { HealthIndicators } from "../models/HealthIndicators";
import type { HydrationState } from "../models/HydrationState";
import type { LifestyleState } from "../models/LifestyleState";
import type { NutritionState } from "../models/NutritionState";
import type { PerformanceState } from "../models/PerformanceState";
import type { ProgressState } from "../models/ProgressState";
import type { ReadinessState } from "../models/ReadinessState";
import type { RecoveryState } from "../models/RecoveryState";
import type { SleepState } from "../models/SleepState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import type { StateChange } from "../models/StateChange";
import type { StateDiagnostics } from "../models/StateDiagnostics";
import type { StateError } from "../models/StateError";
import type { StateSummary } from "../models/StateSummary";
import type {
  StateValidation,
  StateValidationIssue,
} from "../models/StateValidation";
import type { StateVersion } from "../models/StateVersion";
import type { StressState } from "../models/StressState";
import type { TrainingState } from "../models/TrainingState";

export function freezeMetadata(metadata: AthleteMetadata): AthleteMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeVersion(version: StateVersion): StateVersion {
  return Object.freeze({ ...version });
}

export function freezeIdentity(identity: AthleteIdentity): AthleteIdentity {
  return Object.freeze({
    ...identity,
    externalIds: Object.freeze({ ...identity.externalIds }),
  });
}

export function freezeStatus(status: AthleteStatus): AthleteStatus {
  return Object.freeze({
    ...status,
    notes: Object.freeze([...status.notes]),
  });
}

export function freezeComposition(
  composition: BodyComposition,
): BodyComposition {
  return Object.freeze({ ...composition });
}

export function freezeMeasurements(
  measurements: BodyMeasurements,
): BodyMeasurements {
  return Object.freeze({ ...measurements });
}

export function freezeMetrics(metrics: AthleteMetrics): AthleteMetrics {
  return Object.freeze({
    ...metrics,
    measurements: freezeMeasurements(metrics.measurements),
    composition: freezeComposition(metrics.composition),
    notes: Object.freeze([...metrics.notes]),
  });
}

export function freezeProfile(profile: AthleteProfile): AthleteProfile {
  return Object.freeze({
    ...profile,
    identity: freezeIdentity(profile.identity),
    status: freezeStatus(profile.status),
    metadata: freezeMetadata(profile.metadata),
  });
}

export function freezeTraining(training: TrainingState): TrainingState {
  return Object.freeze({
    ...training,
    notes: Object.freeze([...training.notes]),
    sourceAgentIds: Object.freeze([...training.sourceAgentIds]),
  });
}

export function freezeRecovery(recovery: RecoveryState): RecoveryState {
  return Object.freeze({
    ...recovery,
    modalities: Object.freeze([...recovery.modalities]),
    notes: Object.freeze([...recovery.notes]),
    sourceAgentIds: Object.freeze([...recovery.sourceAgentIds]),
  });
}

export function freezeNutrition(nutrition: NutritionState): NutritionState {
  return Object.freeze({
    ...nutrition,
    notes: Object.freeze([...nutrition.notes]),
    sourceAgentIds: Object.freeze([...nutrition.sourceAgentIds]),
  });
}

export function freezePerformance(
  performance: PerformanceState,
): PerformanceState {
  return Object.freeze({
    ...performance,
    highlights: Object.freeze([...performance.highlights]),
    notes: Object.freeze([...performance.notes]),
    sourceAgentIds: Object.freeze([...performance.sourceAgentIds]),
  });
}

export function freezeLifestyle(lifestyle: LifestyleState): LifestyleState {
  return Object.freeze({
    ...lifestyle,
    notes: Object.freeze([...lifestyle.notes]),
  });
}

export function freezeHealth(health: HealthIndicators): HealthIndicators {
  return Object.freeze({
    ...health,
    flags: Object.freeze([...health.flags]),
    notes: Object.freeze([...health.notes]),
  });
}

export function freezeReadiness(readiness: ReadinessState): ReadinessState {
  return Object.freeze({
    ...readiness,
    notes: Object.freeze([...readiness.notes]),
  });
}

export function freezeFatigue(fatigue: FatigueState): FatigueState {
  return Object.freeze({
    ...fatigue,
    notes: Object.freeze([...fatigue.notes]),
  });
}

export function freezeSleep(sleep: SleepState): SleepState {
  return Object.freeze({
    ...sleep,
    notes: Object.freeze([...sleep.notes]),
  });
}

export function freezeStress(stress: StressState): StressState {
  return Object.freeze({
    ...stress,
    notes: Object.freeze([...stress.notes]),
  });
}

export function freezeHydration(hydration: HydrationState): HydrationState {
  return Object.freeze({
    ...hydration,
    notes: Object.freeze([...hydration.notes]),
  });
}

export function freezeEnergy(
  energy: EnergyAvailability,
): EnergyAvailability {
  return Object.freeze({
    ...energy,
    notes: Object.freeze([...energy.notes]),
  });
}

export function freezeGoalItem(item: AthleteGoalItem): AthleteGoalItem {
  return Object.freeze({
    ...item,
    notes: Object.freeze([...item.notes]),
  });
}

export function freezeGoals(goals: AthleteGoals): AthleteGoals {
  return Object.freeze({
    ...goals,
    items: Object.freeze(goals.items.map(freezeGoalItem)),
    sourceAgentIds: Object.freeze([...goals.sourceAgentIds]),
  });
}

export function freezePreferences(
  preferences: AthletePreferences,
): AthletePreferences {
  return Object.freeze({
    preferredTrainingTimes: Object.freeze([
      ...preferences.preferredTrainingTimes,
    ]),
    preferredModalities: Object.freeze([...preferences.preferredModalities]),
    dietaryPreferences: Object.freeze([...preferences.dietaryPreferences]),
    communicationTone: preferences.communicationTone,
    notes: Object.freeze([...preferences.notes]),
  });
}

export function freezeConstraints(
  constraints: AthleteConstraints,
): AthleteConstraints {
  return Object.freeze({
    injuries: Object.freeze([...constraints.injuries]),
    equipmentLimits: Object.freeze([...constraints.equipmentLimits]),
    scheduleLimits: Object.freeze([...constraints.scheduleLimits]),
    medicalFlags: Object.freeze([...constraints.medicalFlags]),
    notes: Object.freeze([...constraints.notes]),
  });
}

export function freezeProgress(progress: ProgressState): ProgressState {
  return Object.freeze({
    milestones: Object.freeze([...progress.milestones]),
    recentWins: Object.freeze([...progress.recentWins]),
    blockers: Object.freeze([...progress.blockers]),
    notes: Object.freeze([...progress.notes]),
    sourceAgentIds: Object.freeze([...progress.sourceAgentIds]),
  });
}

export function freezeCoaching(coaching: CoachingState): CoachingState {
  return Object.freeze({
    ...coaching,
    focusAreas: Object.freeze([...coaching.focusAreas]),
    notes: Object.freeze([...coaching.notes]),
    sourceSessionIds: Object.freeze([...coaching.sourceSessionIds]),
  });
}

export function freezeChange(change: StateChange): StateChange {
  return Object.freeze({
    ...change,
    fromVersion: change.fromVersion ? freezeVersion(change.fromVersion) : null,
    toVersion: freezeVersion(change.toVersion),
    paths: Object.freeze([...change.paths]),
    metadata: freezeMetadata(change.metadata),
  });
}

export function freezeHistoryEntry(
  entry: AthleteHistoryEntry,
): AthleteHistoryEntry {
  return Object.freeze({
    ...entry,
    change: freezeChange(entry.change),
  });
}

export function freezeHistory(history: AthleteHistory): AthleteHistory {
  return Object.freeze({
    ...history,
    entries: Object.freeze(history.entries.map(freezeHistoryEntry)),
    metadata: freezeMetadata(history.metadata),
  });
}

export function freezeTimelineItem(
  item: AthleteTimelineItem,
): AthleteTimelineItem {
  return Object.freeze({
    ...item,
    change: freezeChange(item.change),
  });
}

export function freezeTimeline(timeline: AthleteTimeline): AthleteTimeline {
  return Object.freeze({
    ...timeline,
    items: Object.freeze(timeline.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(timeline.metadata),
  });
}

export function freezeStatistics(
  statistics: AthleteStatistics,
): AthleteStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeDecisionEntry(
  entry: DecisionHistoryEntry,
): DecisionHistoryEntry {
  return Object.freeze({
    ...entry,
    metadata: freezeMetadata(entry.metadata),
  });
}

export function freezeDecisionHistory(
  history: DecisionHistory,
): DecisionHistory {
  return Object.freeze({
    ...history,
    entries: Object.freeze(history.entries.map(freezeDecisionEntry)),
  });
}

export function freezeDiagnostics(
  diagnostics: StateDiagnostics,
): StateDiagnostics {
  return Object.freeze({
    warnings: Object.freeze([...diagnostics.warnings]),
    notes: Object.freeze([...diagnostics.notes]),
    metadata: freezeMetadata(diagnostics.metadata),
  });
}

export function freezeSummary(summary: StateSummary): StateSummary {
  return Object.freeze({
    ...summary,
    version: freezeVersion(summary.version),
    details: Object.freeze([...summary.details]),
    statistics: freezeStatistics(summary.statistics),
  });
}

export function freezeValidationIssue(
  issue: StateValidationIssue,
): StateValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: StateValidation,
): StateValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeError(error: StateError | null): StateError | null {
  return error ? Object.freeze({ ...error }) : null;
}

export function freezeContribution(
  contribution: SpecialistContribution,
): SpecialistContribution {
  return Object.freeze({
    ...contribution,
    training: contribution.training
      ? freezeTraining(contribution.training)
      : null,
    recovery: contribution.recovery
      ? freezeRecovery(contribution.recovery)
      : null,
    nutrition: contribution.nutrition
      ? freezeNutrition(contribution.nutrition)
      : null,
    performance: contribution.performance
      ? freezePerformance(contribution.performance)
      : null,
    readiness: contribution.readiness
      ? freezeReadiness(contribution.readiness)
      : null,
    fatigue: contribution.fatigue ? freezeFatigue(contribution.fatigue) : null,
    sleep: contribution.sleep ? freezeSleep(contribution.sleep) : null,
    stress: contribution.stress ? freezeStress(contribution.stress) : null,
    goals: contribution.goals ? freezeGoals(contribution.goals) : null,
    preferences: contribution.preferences
      ? freezePreferences(contribution.preferences)
      : null,
    constraints: contribution.constraints
      ? freezeConstraints(contribution.constraints)
      : null,
    progress: contribution.progress
      ? freezeProgress(contribution.progress)
      : null,
    coaching: contribution.coaching
      ? freezeCoaching(contribution.coaching)
      : null,
    notes: Object.freeze([...contribution.notes]),
    metadata: freezeMetadata(contribution.metadata),
  });
}

export function freezeRequest(
  request: AthleteStateRequest,
): AthleteStateRequest {
  return Object.freeze({
    ...request,
    contributions: Object.freeze(
      request.contributions.map(freezeContribution),
    ),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeState(state: AthleteState): AthleteState {
  return Object.freeze({
    ...state,
    version: freezeVersion(state.version),
    identity: freezeIdentity(state.identity),
    profile: freezeProfile(state.profile),
    metrics: freezeMetrics(state.metrics),
    status: freezeStatus(state.status),
    bodyComposition: freezeComposition(state.bodyComposition),
    bodyMeasurements: freezeMeasurements(state.bodyMeasurements),
    training: freezeTraining(state.training),
    recovery: freezeRecovery(state.recovery),
    nutrition: freezeNutrition(state.nutrition),
    performance: freezePerformance(state.performance),
    lifestyle: freezeLifestyle(state.lifestyle),
    health: freezeHealth(state.health),
    readiness: freezeReadiness(state.readiness),
    fatigue: freezeFatigue(state.fatigue),
    sleep: freezeSleep(state.sleep),
    stress: freezeStress(state.stress),
    hydration: freezeHydration(state.hydration),
    energyAvailability: freezeEnergy(state.energyAvailability),
    goals: freezeGoals(state.goals),
    preferences: freezePreferences(state.preferences),
    constraints: freezeConstraints(state.constraints),
    progress: freezeProgress(state.progress),
    coaching: freezeCoaching(state.coaching),
    history: freezeHistory(state.history),
    timeline: freezeTimeline(state.timeline),
    statistics: freezeStatistics(state.statistics),
    decisionHistory: freezeDecisionHistory(state.decisionHistory),
    diagnostics: freezeDiagnostics(state.diagnostics),
    summary: state.summary ? freezeSummary(state.summary) : null,
    metadata: freezeMetadata(state.metadata),
  });
}

export function freezeSnapshot(snapshot: AthleteSnapshot): AthleteSnapshot {
  return Object.freeze({
    ...snapshot,
    version: freezeVersion(snapshot.version),
    state: freezeState(snapshot.state),
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    timeline: snapshot.timeline ? freezeTimeline(snapshot.timeline) : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeSupervisorContext(
  context: CoachSupervisorContext,
): CoachSupervisorContext {
  return Object.freeze({
    ...context,
    state: freezeState(context.state),
    snapshot: context.snapshot ? freezeSnapshot(context.snapshot) : null,
    summary: context.summary ? freezeSummary(context.summary) : null,
    focusAreas: Object.freeze([...context.focusAreas]),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeDescriptor(
  descriptor: AthleteStateDescriptor,
): AthleteStateDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function freezeResult(result: AthleteStateResult): AthleteStateResult {
  return Object.freeze({
    ...result,
    state: result.state ? freezeState(result.state) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    supervisorContext: result.supervisorContext
      ? freezeSupervisorContext(result.supervisorContext)
      : null,
    descriptor: result.descriptor ? freezeDescriptor(result.descriptor) : null,
    validation: freezeValidation(result.validation),
    diagnostics: freezeDiagnostics(result.diagnostics),
    error: freezeError(result.error),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeAthleteState = Object.freeze({
  freezeMetadata,
  freezeState,
  freezeSnapshot,
  freezeRequest,
  freezeResult,
  freezeSummary,
  freezeTimeline,
  freezeHistory,
  freezeContribution,
  freezeSupervisorContext,
  freezeDescriptor,
});
`,
);

write(
  "utils/StateHelpers.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";

export function collectSourceAgentIds(
  state: AthleteState,
): readonly string[] {
  const ids = new Set<string>();
  for (const id of state.training.sourceAgentIds) ids.add(id);
  for (const id of state.recovery.sourceAgentIds) ids.add(id);
  for (const id of state.nutrition.sourceAgentIds) ids.add(id);
  for (const id of state.performance.sourceAgentIds) ids.add(id);
  for (const id of state.goals.sourceAgentIds) ids.add(id);
  for (const id of state.progress.sourceAgentIds) ids.add(id);
  return Object.freeze([...ids]);
}

export function contributionPaths(
  contribution: SpecialistContribution,
): readonly string[] {
  const paths: string[] = [];
  if (contribution.training) paths.push("training");
  if (contribution.recovery) paths.push("recovery");
  if (contribution.nutrition) paths.push("nutrition");
  if (contribution.performance) paths.push("performance");
  if (contribution.readiness) paths.push("readiness");
  if (contribution.fatigue) paths.push("fatigue");
  if (contribution.sleep) paths.push("sleep");
  if (contribution.stress) paths.push("stress");
  if (contribution.goals) paths.push("goals");
  if (contribution.preferences) paths.push("preferences");
  if (contribution.constraints) paths.push("constraints");
  if (contribution.progress) paths.push("progress");
  if (contribution.coaching) paths.push("coaching");
  return Object.freeze(paths);
}

export function mergeUniqueStrings(
  ...lists: readonly (readonly string[])[]
): readonly string[] {
  const set = new Set<string>();
  for (const list of lists) {
    for (const item of list) set.add(item);
  }
  return Object.freeze([...set]);
}
`,
);

write(
  "utils/TimelineHelpers.ts",
  `import type { AthleteTimeline } from "../models/AthleteTimeline";

export function timelineLength(timeline: AthleteTimeline): number {
  return timeline.items.length;
}

export function lastTimelineOccurredAt(
  timeline: AthleteTimeline,
): string | null {
  const last = timeline.items[timeline.items.length - 1];
  return last?.occurredAt ?? null;
}
`,
);

write(
  "utils/StatisticsHelpers.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { AthleteStatistics } from "../models/AthleteStatistics";
import { collectSourceAgentIds } from "./StateHelpers";

/**
 * Structural counts only — no domain calculations.
 */
export function buildStatistics(state: AthleteState): AthleteStatistics {
  return Object.freeze({
    updateCount: state.history.entries.length,
    snapshotCount: state.statistics.snapshotCount,
    historyEntryCount: state.history.entries.length,
    timelineItemCount: state.timeline.items.length,
    goalCount: state.goals.items.length,
    sourceAgentCount: collectSourceAgentIds(state).length,
  });
}
`,
);

write(
  "utils/VersionHelpers.ts",
  `import {
  formatStateVersion,
  type StateVersion,
} from "../models/StateVersion";

export function bumpRevision(version: StateVersion): StateVersion {
  const next = Object.freeze({
    ...version,
    revision: version.revision + 1,
    label: "",
  });
  return Object.freeze({
    ...next,
    label: formatStateVersion(next),
  });
}

export function versionsEqual(a: StateVersion, b: StateVersion): boolean {
  return (
    a.major === b.major &&
    a.minor === b.minor &&
    a.patch === b.patch &&
    a.revision === b.revision
  );
}

export function isVersionNonNegative(version: StateVersion): boolean {
  return (
    version.major >= 0 &&
    version.minor >= 0 &&
    version.patch >= 0 &&
    version.revision >= 0
  );
}
`,
);

write(
  "utils/FormattingHelpers.ts",
  `import type { AthleteState } from "../models/AthleteState";
import { formatStateVersion } from "../models/StateVersion";

export function formatAthleteHeadline(state: AthleteState): string {
  const status = state.status.kind;
  const version = formatStateVersion(state.version);
  return \`Athlete \${state.athleteId} is \${status} at version \${version}\`;
}

export function formatGoalTitles(state: AthleteState): readonly string[] {
  return Object.freeze(state.goals.items.map((g) => g.title));
}
`,
);

write(
  "utils/index.ts",
  `export * from "./FreezeAthleteState";
export * from "./StateHelpers";
export * from "./TimelineHelpers";
export * from "./StatisticsHelpers";
export * from "./VersionHelpers";
export * from "./FormattingHelpers";
`,
);

// Contracts — lightweight ports (no provider SDKs)
write(
  "contracts/WorkoutAgentPort.ts",
  `import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

/**
 * Port for Workout Agent contributions into Athlete State.
 * Consumes agent contracts structurally — no networking / SDKs.
 */
export interface WorkoutAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly agentId?: string;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockWorkoutAgentPort(
  contribution?: SpecialistContribution | null,
): WorkoutAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      return freezeContribution({
        id: \`contribution:workout:\${input.athleteId}\`,
        source: SpecialistSources.WORKOUT,
        agentId: input.agentId ?? "agent:workout",
        athleteId: input.athleteId,
        training: Object.freeze({
          phase: "build",
          focus: "strength",
          sessionsPerWeek: 4,
          lastSessionId: "session:workout:1",
          lastSessionAt: input.at ?? "2026-07-25T12:00:00.000Z",
          programId: "program:1",
          notes: Object.freeze(["mock workout contribution"]),
          sourceAgentIds: Object.freeze([
            input.agentId ?? "agent:workout",
          ]),
        }),
        recovery: null,
        nutrition: null,
        performance: Object.freeze({
          lastSnapshotId: "perf:1",
          trendLabel: "stable",
          highlights: Object.freeze(["completed last session"]),
          notes: Object.freeze([] as string[]),
          sourceAgentIds: Object.freeze([
            input.agentId ?? "agent:workout",
          ]),
        }),
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["mock workout agent"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
`,
);

write(
  "contracts/NutritionAgentPort.ts",
  `import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

export interface NutritionAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly agentId?: string;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockNutritionAgentPort(
  contribution?: SpecialistContribution | null,
): NutritionAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      return freezeContribution({
        id: \`contribution:nutrition:\${input.athleteId}\`,
        source: SpecialistSources.NUTRITION,
        agentId: input.agentId ?? "agent:nutrition",
        athleteId: input.athleteId,
        training: null,
        recovery: null,
        nutrition: Object.freeze({
          planId: "nutrition-plan:1",
          dietaryPattern: "balanced",
          lastLoggedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          targetsPresent: true,
          notes: Object.freeze(["mock nutrition contribution"]),
          sourceAgentIds: Object.freeze([
            input.agentId ?? "agent:nutrition",
          ]),
        }),
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["mock nutrition agent"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
`,
);

write(
  "contracts/RecoveryAgentPort.ts",
  `import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

export interface RecoveryAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly agentId?: string;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockRecoveryAgentPort(
  contribution?: SpecialistContribution | null,
): RecoveryAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      return freezeContribution({
        id: \`contribution:recovery:\${input.athleteId}\`,
        source: SpecialistSources.RECOVERY,
        agentId: input.agentId ?? "agent:recovery",
        athleteId: input.athleteId,
        training: null,
        recovery: Object.freeze({
          status: "adequate",
          lastRecoverySessionId: "recovery:1",
          lastAssessedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          modalities: Object.freeze(["sleep", "mobility"]),
          notes: Object.freeze(["mock recovery contribution"]),
          sourceAgentIds: Object.freeze([
            input.agentId ?? "agent:recovery",
          ]),
        }),
        nutrition: null,
        performance: null,
        readiness: Object.freeze({
          label: "ready",
          reportedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          notes: Object.freeze([] as string[]),
        }),
        fatigue: Object.freeze({
          label: "low",
          reportedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          notes: Object.freeze([] as string[]),
        }),
        sleep: Object.freeze({
          lastNightHours: 7.5,
          qualityLabel: "good",
          reportedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          notes: Object.freeze([] as string[]),
        }),
        stress: Object.freeze({
          label: "moderate",
          reportedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          notes: Object.freeze([] as string[]),
        }),
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["mock recovery agent"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
`,
);

write(
  "contracts/GoalAgentPort.ts",
  `import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

/**
 * Port for future Goal Agent — mocked until Goal Agent lands.
 */
export interface GoalAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly agentId?: string;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockGoalAgentPort(
  contribution?: SpecialistContribution | null,
): GoalAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      return freezeContribution({
        id: \`contribution:goal:\${input.athleteId}\`,
        source: SpecialistSources.GOAL,
        agentId: input.agentId ?? "agent:goal",
        athleteId: input.athleteId,
        training: null,
        recovery: null,
        nutrition: null,
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: Object.freeze({
          primaryGoalId: "goal:1",
          items: Object.freeze([
            Object.freeze({
              id: "goal:1",
              kind: "strength",
              title: "Increase squat",
              status: "active",
              targetDate: null,
              notes: Object.freeze([] as string[]),
            }),
          ]),
          sourceAgentIds: Object.freeze([input.agentId ?? "agent:goal"]),
        }),
        preferences: null,
        constraints: null,
        progress: Object.freeze({
          milestones: Object.freeze(["baseline established"]),
          recentWins: Object.freeze([] as string[]),
          blockers: Object.freeze([] as string[]),
          notes: Object.freeze([] as string[]),
          sourceAgentIds: Object.freeze([input.agentId ?? "agent:goal"]),
        }),
        coaching: null,
        notes: Object.freeze(["mock goal agent"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
`,
);

write(
  "contracts/CoachingSessionPort.ts",
  `import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

/**
 * Port for Coaching Session Runtime contributions.
 */
export interface CoachingSessionPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly intent?: string | null;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockCoachingSessionPort(
  contribution?: SpecialistContribution | null,
): CoachingSessionPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const sessionId = input.sessionId ?? "session:coach:1";
      return freezeContribution({
        id: \`contribution:session:\${input.athleteId}\`,
        source: SpecialistSources.SESSION,
        agentId: "runtime:coaching-session",
        athleteId: input.athleteId,
        training: null,
        recovery: null,
        nutrition: null,
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: Object.freeze({
          activeSessionId: sessionId,
          lastSessionId: sessionId,
          lastIntent: input.intent ?? "general coaching",
          focusAreas: Object.freeze(["training", "recovery"]),
          notes: Object.freeze(["mock coaching session"]),
          sourceSessionIds: Object.freeze([sessionId]),
        }),
        notes: Object.freeze(["mock coaching session runtime"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
`,
);

write(
  "contracts/index.ts",
  `export * from "./WorkoutAgentPort";
export * from "./NutritionAgentPort";
export * from "./RecoveryAgentPort";
export * from "./GoalAgentPort";
export * from "./CoachingSessionPort";
`,
);

console.log("Part 2 (utils + contracts) written");
