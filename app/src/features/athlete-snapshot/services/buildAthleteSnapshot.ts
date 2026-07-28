import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { AthleteWorkspace } from "../../intelligence-workspace/models/AthleteWorkspace";
import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { SnapshotResult } from "../models/SnapshotResult";
import { buildCoachProjection } from "./buildCoachProjection";
import { buildEvidence } from "./buildEvidence";
import { buildIdentity } from "./buildIdentity";
import { buildMetadata } from "./buildMetadata";
import { buildState } from "./buildState";
import { buildTimelineProjection } from "./buildTimelineProjection";
import { buildVersion } from "./buildVersion";
import { buildWorkspaceProjection } from "./buildWorkspaceProjection";
import { validateIntegrity } from "./validateIntegrity";

export interface BuildAthleteSnapshotInput {
  readonly athleteId: string;
  readonly createdAt: string;
  readonly athleteState?: AthleteState | null;
  readonly goalProgress?: GoalProgress | null;
  readonly workspace?: AthleteWorkspace | null;
  readonly timeline?: CoachTimeline | null;
  readonly latestEvents?: readonly CoachTimelineEntry[];
  readonly latestDecisions?: readonly CoachTimelineEntry[];
  readonly latestRestores?: readonly CoachTimelineEntry[];
  readonly coachingSession?: CoachingSession | null;
  readonly weeklyReport?: WeeklyCoachReport | null;
  readonly currentPhase?: string | null;
  readonly recoveryState?: string | null;
  readonly applicationVersion?: string;
  readonly schemaVersion?: string;
  readonly snapshotVersion?: string;
}

/**
 * Composes the complete immutable Athlete Snapshot from existing domain artifacts.
 */
export function buildAthleteSnapshot(
  input: BuildAthleteSnapshotInput,
): SnapshotResult {
  const identity = buildIdentity({
    athleteId: input.athleteId,
    createdAt: input.createdAt,
  });
  const state = buildState({
    athleteId: input.athleteId,
    athleteState: input.athleteState ?? null,
    goalProgress: input.goalProgress ?? null,
    currentPhase: input.currentPhase,
    recoveryState: input.recoveryState,
  });
  const workspace = buildWorkspaceProjection({
    athleteId: input.athleteId,
    workspace: input.workspace ?? null,
  });
  const timeline = buildTimelineProjection({
    athleteId: input.athleteId,
    timeline: input.timeline ?? null,
    latestEvents: input.latestEvents,
    latestDecisions: input.latestDecisions,
    latestRestores: input.latestRestores,
  });
  const coach = buildCoachProjection({
    athleteId: input.athleteId,
    coachingSession: input.coachingSession ?? null,
  });
  const metadata = buildMetadata({
    generatedAt: input.createdAt,
    weeklyReport: input.weeklyReport ?? null,
    applicationVersion: input.applicationVersion,
    schemaVersion: input.schemaVersion,
  });
  const version = buildVersion({
    snapshotVersion: input.snapshotVersion,
    workspace: input.workspace ?? null,
    timeline: input.timeline ?? null,
    coachingSession: input.coachingSession ?? null,
  });
  const evidence = buildEvidence({
    athleteId: input.athleteId,
    workspace,
    timeline,
    coach,
  });

  let snapshot = Object.freeze({
    id: identity.snapshotId,
    athleteId: input.athleteId,
    identity,
    state,
    workspace,
    timeline,
    coach,
    metadata,
    version,
    evidence,
    integrity: Object.freeze({
      valid: true,
      errors: Object.freeze([]),
    }),
  }) as AthleteSnapshot;

  const integrity = validateIntegrity(snapshot);
  snapshot = Object.freeze({
    ...snapshot,
    integrity,
  });

  if (!integrity.valid) {
    return Object.freeze({
      id: `${identity.snapshotId}:invalid`,
      success: false,
      snapshot: null,
      identity,
      metadata,
      integrity,
      message: `Athlete snapshot validation failed: ${integrity.errors.join("; ")}`,
      generatedAt: input.createdAt,
    });
  }

  return Object.freeze({
    id: identity.snapshotId,
    success: true,
    snapshot,
    identity,
    metadata,
    integrity,
    message:
      "Athlete snapshot composed deterministically from existing coaching artifacts.",
    generatedAt: input.createdAt,
  });
}
