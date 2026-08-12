import { getCompositionRoot } from "../../core/composition/createCompositionRoot";
import { composeAthleteIdentity } from "../../features/athlete-identity/application";
import { composeAthleteSnapshot } from "../../features/athlete-snapshot/application";
import type { AthleteSnapshotService } from "../../features/athlete-snapshot/services/AthleteSnapshotService";
import { CoachConversationIntents } from "../../features/coach-conversation/models/CoachConversationIntent";
import { composeCoachingSession } from "../../features/coaching-session/composition/application";
import type { ExplainableCoachingSessionService } from "../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { CoachTimelineService } from "../../features/coach-timeline/services/CoachTimelineService";
import { composeAthleteWorkspace } from "../../features/intelligence-workspace/application";
import type { AthleteWorkspaceService } from "../../features/intelligence-workspace/services/AthleteWorkspaceService";
import { composeUnifiedWorkspace } from "../../features/unified-workspace/application";
import { getBootstrapStatus } from "../bootstrap/application/getBootstrapStatus";
import { BOOTSTRAP_STATUS } from "../bootstrap/BootstrapStatus";
import { persistRuntime } from "../write-through/application/persistRuntime";
import { RuntimeSessionError } from "./RuntimeSessionError";

/**
 * Optional profile fields sourced from the current AuthContext user for the
 * first-run identity only. Never a cached athlete id.
 */
export interface FirstRunIdentitySeed {
  readonly displayName?: string;
  readonly givenName?: string | null;
  readonly familyName?: string | null;
}

export interface InitializeFirstRunRuntimeOptions {
  readonly athleteIds?: readonly string[];
  readonly identitySeed?: FirstRunIdentitySeed;
  readonly clock?: () => string;
}

/**
 * Minimum required inputs for existing identity builders. Preferences and
 * settings already default inside `buildPreferences` / `buildSettings`.
 */
const FIRST_RUN_LOCALE = Object.freeze({ languageTag: "en-US" });
const FIRST_RUN_UNITS = Object.freeze({ system: "metric" as const });
const FIRST_RUN_TIME_ZONE = Object.freeze({ iana: "Etc/UTC" });

function fail(message: string): never {
  throw new RuntimeSessionError(message, "initialization_failed");
}

function resolveDisplayName(seed: FirstRunIdentitySeed | undefined): string {
  const fromSeed = seed?.displayName?.trim();
  return fromSeed && fromSeed.length > 0 ? fromSeed : "Athlete";
}

/**
 * First-run runtime initialization (Sprint 38.3).
 *
 * After hydration, a brand-new athlete has no Athlete Identity and no
 * Unified Workspace. Dashboard Restore then falls back to an empty Home
 * dashboard and Profile/feature screens cannot read hydrated identity.
 *
 * This is not a second initialization system: it calls the existing
 * compose application APIs, then persists through `persistRuntime()` so
 * Dashboard Restore and a later restart see the same records. No-ops when
 * bootstrap did not actually complete (mocked pipeline tests) or when the
 * records already exist.
 */
export async function initializeFirstRunRuntime(
  options: InitializeFirstRunRuntimeOptions = {},
): Promise<void> {
  const athleteIds = options.athleteIds ?? [];
  if (athleteIds.length === 0) {
    return;
  }

  if (getBootstrapStatus() !== BOOTSTRAP_STATUS.ready) {
    return;
  }

  const clock = options.clock ?? (() => new Date().toISOString());
  const generatedAt = clock();
  const root = getCompositionRoot();
  const identityService = root.resolve("AthleteIdentityService");
  const workspaceService = root.resolve("UnifiedWorkspaceService");
  const timelineService = root.resolve("CoachTimelineService");
  const coachingSessionService = root.resolve(
    "ExplainableCoachingSessionService",
  );
  const athleteWorkspaceService = root.resolve("AthleteWorkspaceService");
  const snapshotService = root.resolve("AthleteSnapshotService");

  let created = false;

  try {
    for (const athleteId of athleteIds) {
      if (!identityService.getAthleteIdentity(athleteId)) {
        const result = composeAthleteIdentity({
          service: identityService,
          input: {
            athleteId,
            requestId: `first-run:identity:${athleteId}`,
            generatedAt,
            profile: {
              displayName: resolveDisplayName(options.identitySeed),
              givenName: options.identitySeed?.givenName ?? null,
              familyName: options.identitySeed?.familyName ?? null,
            },
            locale: FIRST_RUN_LOCALE,
            units: FIRST_RUN_UNITS,
            timeZone: FIRST_RUN_TIME_ZONE,
          },
        });
        if (!result.success || !result.identity) {
          fail(result.message);
        }
        created = true;
      }

      if (!workspaceService.getWorkspace(athleteId)) {
        ensureFirstRunWorkspaceDependencies({
          athleteId,
          generatedAt,
          timelineService,
          coachingSessionService,
          athleteWorkspaceService,
          snapshotService,
        });

        const result = composeUnifiedWorkspace({
          service: workspaceService,
          input: {
            athleteId,
            requestId: `first-run:workspace:${athleteId}`,
            generatedAt,
          },
        });
        if (!result.success || !result.workspace) {
          fail(result.message);
        }
        created = true;
      }
    }

    if (created) {
      await persistRuntime({ athleteIds });
    }
  } catch (error) {
    if (error instanceof RuntimeSessionError) {
      throw error;
    }
    fail(
      error instanceof Error
        ? error.message
        : "First-run runtime initialization failed",
    );
  }
}

/**
 * Unified Workspace validation requires a snapshot, timeline, and coaching
 * session. Those are composed through their existing application APIs —
 * the same services the Composition Root already wires into
 * `UnifiedWorkspaceService.build()`.
 */
function ensureFirstRunWorkspaceDependencies(input: {
  readonly athleteId: string;
  readonly generatedAt: string;
  readonly timelineService: CoachTimelineService;
  readonly coachingSessionService: ExplainableCoachingSessionService;
  readonly athleteWorkspaceService: AthleteWorkspaceService;
  readonly snapshotService: AthleteSnapshotService;
}): void {
  const {
    athleteId,
    generatedAt,
    timelineService,
    coachingSessionService,
    athleteWorkspaceService,
    snapshotService,
  } = input;

  if (!timelineService.getTimeline(athleteId)) {
    timelineService.restorePersisted({
      athleteId,
      entries: Object.freeze([]),
      entryCount: 0,
      createdAt: generatedAt,
      updatedAt: generatedAt,
    });
  }

  if (!coachingSessionService.getLatest(athleteId)) {
    const result = composeCoachingSession({
      service: coachingSessionService,
      input: {
        athleteId,
        conversationId: `first-run:conversation:${athleteId}`,
        sessionId: null,
        userRequest: "",
        conversationIntent: CoachConversationIntents.GENERAL_COACHING,
        requestId: `first-run:session:${athleteId}`,
        generatedAt,
      },
    });
    if (!result.success || !result.session) {
      fail(result.message);
    }
  }

  if (!athleteWorkspaceService.getAthleteWorkspace(athleteId)) {
    const result = composeAthleteWorkspace({
      service: athleteWorkspaceService,
      input: {
        athleteId,
        requestId: `first-run:intelligence-workspace:${athleteId}`,
        generatedAt,
      },
    });
    if (!result.success || !result.workspace) {
      fail(result.message);
    }
  }

  if (!snapshotService.getCurrentSnapshot(athleteId)) {
    const result = composeAthleteSnapshot({
      service: snapshotService,
      input: {
        athleteId,
        createdAt: generatedAt,
      },
    });
    if (!result.success || !result.snapshot) {
      fail(result.message);
    }
  }
}
