import type { Workspace } from "../models/Workspace";
import type { WorkspaceValidation } from "../models/WorkspaceResult";

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

function findDuplicateIds(ids: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (!id) continue;
    if (seen.has(id)) duplicates.add(id);
    else seen.add(id);
  }
  return Object.freeze([...duplicates]);
}

/**
 * Validates the immutable Unified Athlete Workspace.
 */
export function validateWorkspace(
  workspace: Workspace | null | undefined,
): WorkspaceValidation {
  const errors: string[] = [];

  if (!workspace) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Unified athlete workspace is missing"]),
    });
  }

  if (!workspace.id) errors.push("Workspace id is required");
  if (!workspace.athleteId) errors.push("Workspace athleteId is required");
  if (!workspace.header) errors.push("Workspace header is required");
  if (!workspace.summary) errors.push("Workspace summary is required");
  if (!workspace.health) errors.push("Workspace health is required");
  if (!workspace.goals) errors.push("Workspace goals is required");
  if (!workspace.workout) errors.push("Workspace workout is required");
  if (!workspace.nutrition) errors.push("Workspace nutrition is required");
  if (!workspace.recovery) errors.push("Workspace recovery is required");
  if (!workspace.insights) errors.push("Workspace insights is required");
  if (!workspace.timeline) errors.push("Workspace timeline is required");
  if (!workspace.coach) errors.push("Workspace coach is required");
  if (!workspace.snapshot) errors.push("Workspace snapshot is required");
  if (!workspace.metadata) errors.push("Workspace metadata is required");

  if (!workspace.snapshot?.present || !workspace.snapshot.snapshot) {
    errors.push("Athlete snapshot artifact is missing");
  }
  if (!workspace.timeline?.present || !workspace.timeline.timeline) {
    errors.push("Coach timeline artifact is missing");
  }
  if (!workspace.coach?.present || !workspace.coach.session) {
    errors.push("Explainable coaching session artifact is missing");
  }

  const sections = [
    workspace.header,
    workspace.summary,
    workspace.health,
    workspace.goals,
    workspace.workout,
    workspace.nutrition,
    workspace.recovery,
    workspace.insights,
    workspace.timeline,
    workspace.coach,
    workspace.snapshot,
  ] as const;

  for (const section of sections) {
    if (section && "athleteId" in section && section.athleteId !== workspace.athleteId) {
      errors.push(
        `Invalid reference: section athleteId must match workspace athleteId`,
      );
      break;
    }
  }

  if (workspace.metadata?.workspaceId !== workspace.id) {
    errors.push("Metadata workspaceId must match workspace id");
  }
  if (
    workspace.snapshot?.snapshotId !==
    (workspace.snapshot?.snapshot?.id ?? null)
  ) {
    errors.push("Snapshot projection must reference the current snapshot id");
  }
  if (
    workspace.coach?.sessionId !== (workspace.coach?.session?.id ?? null)
  ) {
    errors.push("Coach projection must reference the current session id");
  }

  if (
    workspace.header?.generatedAt &&
    workspace.summary?.generatedAt &&
    workspace.header.generatedAt !== workspace.summary.generatedAt
  ) {
    errors.push("Inconsistent timestamps between header and summary");
  }
  if (
    workspace.metadata?.generatedAt &&
    workspace.summary?.generatedAt &&
    workspace.metadata.generatedAt !== workspace.summary.generatedAt
  ) {
    errors.push("Inconsistent timestamps between metadata and summary");
  }
  if (
    workspace.snapshot?.snapshot?.metadata.generatedAt &&
    workspace.metadata?.generatedAt &&
    workspace.snapshot.snapshot.metadata.generatedAt >
      workspace.metadata.generatedAt
  ) {
    errors.push("Snapshot generatedAt must not exceed workspace generatedAt");
  }

  const timelineIds = (workspace.timeline?.timeline?.entries ?? []).map(
    (entry) => entry.id,
  );
  const duplicateTimelineIds = findDuplicateIds(timelineIds);
  for (const id of duplicateTimelineIds) {
    errors.push(`Duplicate timeline entry id: ${id}`);
  }

  const insightIds = (workspace.insights?.insights ?? []).map((item) => item.id);
  const duplicateInsightIds = findDuplicateIds(insightIds);
  for (const id of duplicateInsightIds) {
    errors.push(`Duplicate insight id: ${id}`);
  }

  const requiredFrozen: Array<[string, unknown]> = [
    ["header", workspace.header],
    ["summary", workspace.summary],
    ["health", workspace.health],
    ["goals", workspace.goals],
    ["workout", workspace.workout],
    ["nutrition", workspace.nutrition],
    ["recovery", workspace.recovery],
    ["insights", workspace.insights],
    ["timeline", workspace.timeline],
    ["coach", workspace.coach],
    ["snapshot", workspace.snapshot],
    ["metadata", workspace.metadata],
    ["workspace", workspace],
  ];
  for (const [name, value] of requiredFrozen) {
    if (value == null) {
      errors.push(`Null immutable field: ${name}`);
    } else if (!isFrozen(value)) {
      errors.push(`${name} must be immutable`);
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertWorkspaceImmutable(workspace: Workspace): void {
  if (!Object.isFrozen(workspace)) {
    throw new Error("Workspace must be frozen");
  }
}
